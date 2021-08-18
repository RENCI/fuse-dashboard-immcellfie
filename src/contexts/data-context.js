import React, { createContext, useReducer } from "react";
import { csvParseRows, csvParse } from "d3-dsv";
import { randomInt } from "d3-random";
import { stratify } from "d3-hierarchy";
import { merge, mean, group } from "d3-array";
import ttest2 from "@stdlib/stats/ttest2";

const excludedPhenotypes = [
  "participant_id",
  "biosample_accession"
];

const timeSort = {
  Hours: 0,
  Days: 1,
  Months: 2,
  Years: 3
};

const initialState = {
  // Info for current dataset (source, names, etc.)
  dataInfo: null,

  // Phenotype data for each subject
  rawPhenotypeData: null,
  phenotypeData: null,

  // Phenotype options created from phenotype data
  phenotypes: null,

  // Subgroups
  subgroups: null,

  // Subgroups selected for visualization
  selectedSubgroups: null,

  // Expression data used as CellFIE input
  expressionFile: null,
  rawExpressionData: null,
  expressionData: null,

  // CellFIE output
  rawOutput: null,
  output: null,

  // CellFIE output with hierarchy info
  hierarchy: null,

  // CellFIE output in tree format, used for aggregating info and for the Voronoi treemap,
  // since we have to calculate the layout external to the Vega spec
  tree: null,

  // Method for handling subgroup overlap
  overlapMethod: "both"
};

const parseExpressionData = data => {
  return csvParseRows(data, row => {
    return {
      gene: row[0],
      values: row.slice(1).map(d => +d)
    };
  });
};

const parseNumber = d => d < 0 ? NaN : +d;

const parsePhenotypeDataRandomize = (data, n = 32) => {
  const csv = csvParse(data);

  const random = randomInt(csv.length);

  const result = [];

  for (let i = 0; i < n; i++) {
    const subject = csv[random()];

    subject.index = i;

    result.push({...subject});
  }

  result.columns = csv.columns;

  return result;
}

const parsePhenotypeData = data => {
  const csv = csvParse(data);

  csv.forEach((subject, i) => subject.index = i);

  return csv;
}

const parseCSVOutput = data => {
  return {
    tasks: csvParseRows(data, (row, i) => {
      if (i === 0) return;

      const offset = 4;
      const n = (row.length - offset) / 2;

      return {
        id: row[0],
        name: row[1],        
        phenotype: [row[1], row[3], row[2]],
        scores: row.slice(offset, offset + n).map(parseNumber),
        activities: row.slice(offset + n).map(parseNumber)
      };      
    })
  };
};

const combineOutput = (taskInfo, score, scoreBinary) => {
  console.log(taskInfo);
  console.log(score);
  console.log(scoreBinary);

  const taskInfoParsed = csvParseRows(taskInfo).slice(1);
  const scoreParsed = csvParseRows(score);
  const scoreBinaryParsed = csvParseRows(scoreBinary);

  return {
    tasks: taskInfoParsed.map((task, i) => {
      return {
        id: task[0],
        name: task[1],        
        phenotype: [task[1], task[3], task[2]],
        scores: scoreParsed[i].map(parseNumber),
        activities: scoreBinaryParsed[i].map(parseNumber)
      };  
    })
  }
};

const createPhenotypes = phenotypeData => {
  return phenotypeData.columns
    .filter(column => !excludedPhenotypes.includes(column))
    .map(column => {
      const values = phenotypeData.reduce((values, row) => {
        const v = row[column];
        let value = values.find(({ value }) => value === v);

        if (!value) {
          value = { 
            value: v,  
            count: 0 
          };

          values.push(value);
        }

        value.count++;

        return values;
      }, []);

      const numeric = values.reduce((numeric, value) => numeric && !isNaN(value.value), true);

      // Sort
      if (numeric) {
        values.forEach((value, i, values) => values[i].value = +values[i].value);
        values.sort((a, b) => a.value - b.value);
      }
      else if (column === "study_time_collected_unit") {
        values.sort((a, b) => timeSort[a.value] - timeSort[b.value]);
      }
      else {
        values.sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0);
      }

      return {
        name: column,
        values: values,
        numeric: numeric
      };
    });
};

const createHierarchy = output => {
  const hierarchy = !output ? [] : Object.values(output.tasks.reduce((data, task) => {
    // Add nodes for phenotype
    task.phenotype.forEach((name, i, a) => { 
      const top = i === a.length - 1;

      data[name] = {
        name: name,
        parent: top ? "root" : a[i + 1],
      };

      // Remove "METABOLISM" from top-level for shorter labels
      if (top) {
        data[name].label = name.replace(" METABOLISM", "");
      }
    });

    // Add nodes for scores
    task.scores.forEach((score, i) => {
      const parent = task.phenotype[0];
      const id = parent + "_" + i;

      data[id] = {
        index: i,
        name: "subject " + i,
        parent: parent,
        score: score,
        activity: task.activities[i]       
      };
    });

    return data;
  }, {}));

  hierarchy.push({
    name: "root",
    parent: null
  });

  return hierarchy;
}

const createTree = hierarchy => {
  const tree = stratify()
      .id(d => d.name)
      .parentId(d => d.parent)
      (hierarchy);

  tree.eachAfter(node => {
    if (!node.children) return;

    node.children.forEach(child => {
      if (child.data.allScores) {
        if (!node.data.allScores) {
          node.data.allScores = [...child.data.allScores];
          node.data.allActivities = [...child.data.allActivities];
        }
        else {
          child.data.allScores.forEach((scores, i) => {
            node.data.allScores[i] = node.data.allScores[i].concat(scores);
          });

          child.data.allActivities.forEach((activities, i) => {
            node.data.allActivities[i] = node.data.allActivities[i].concat(activities);
          });
        }
      }
      else {
        if (!node.data.allScores) {
          node.data.allScores = [];
          node.data.allActivities = [];
        }

        node.data.allScores.push([child.data.score]);
        node.data.allActivities.push([child.data.activity]);
      }
    }); 
  });

  tree.eachBefore(node => {
    if (node.depth === 0) {
      node.data.phenotype = [];

      return;
    }

    node.data.phenotype = node.parent.data.phenotype.concat(node.data.name);  
  });

  return tree;
};

const getSubgroup = (key, subgroups) => key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;

const subgroupContains = (subgroup, index) => subgroup && subgroup.subjects.some(subject => subject.index === index);

const updateTree = (tree, subgroups, selectedSubgroups, overlapMethod) => {
  if (!tree) return;

  // Get subgroups
  const subgroup1 = getSubgroup(selectedSubgroups[0], subgroups);
  const subgroup2 = getSubgroup(selectedSubgroups[1], subgroups);

  const getSubjects = (subgroup, other, which) => {
    return !subgroup ? [] : subgroup.subjects.filter(({ index }) => { 
      const conflict = () => other && other.subjects.find(subject => subject.index === index);

      return overlapMethod === "both" ? true : 
        overlapMethod === "neither" && conflict() ? false :
        overlapMethod === which ? true :
        conflict() ? false :
        true;
    });
  };

  const subjects1 = getSubjects(subgroup1, subgroup2, "subgroup1");
  const subjects2 = getSubjects(subgroup2, subgroup1, "subgroup2");

  tree.each(node => {
    // Check if it is a leaf node (single subject)
    if (!node.data.allScores) {
      // Set default (not in a subgroup)
      node.data.score1 = "na";
      node.data.score2 = "na";

      node.data.activity1 = "na";
      node.data.activity2 = "na";

      node.data.scoreFoldChange = "na";
      node.data.activityChange = "na";

      node.data.scorePValue = "na";

      if (subgroupContains(subgroup1, node.data.index)) {
        node.data.score1 = node.data.score;
        node.data.activity1 = node.data.activity;
      }

      if (subgroupContains(subgroup2, node.data.index)) {
        node.data.score2 = node.data.score;
        node.data.activity2 = node.data.activity;
      }

      return;
    }

    // Compute subgroup scores and activities
    const processSubgroup = (subjects, which) => {
      if (subjects.length === 0) {
        node.data["scores" + which] = [];
        node.data["score" + which] = null;
        node.data["activities" + which] = [];
        node.data["activity" + which] = null;        
      }
      else {
        const getValues = arrayName => {
          return merge(subjects.map(({ index }) => {
            return node.data[arrayName][index].map(value => {
              return {
                value: value,
                index: index,
                subgroup: which, 
                subgroupName: which === 1 ? subgroup1.name : subgroup2.name
              };
            });
          }));
        };

        const scores = getValues("allScores");
        const activities = getValues("allActivities");

        node.data["scores" + which] = scores;
        node.data["score" + which] = mean(scores, score => score.value);
        node.data["activities" + which] = activities;
        node.data["activity" + which] = mean(activities, activity => activity.value);
      }
    }

    processSubgroup(subjects1, 1);
    processSubgroup(subjects2, 2);

    // Compute fold change and p value
    if (node.data.score1 !== null && node.data.score2 !== null) {
      const foldChange = (a, b) => a === 0 ? 0 : b / a;

      const pValue = (a1, a2) => {
        const v1 = a1.filter(({ value }) => !isNaN(value)).map(({ value }) => value);
        const v2 = a2.filter(({ value }) => !isNaN(value)).map(({ value }) => value);

        if (v1.length < 1 || v2.length < 1) {
          return 1;
        }
        else {
          const { pValue } = ttest2(v1, v2);
          return Math.max(pValue, 0.0001);
        }
      };

      node.data.scoreFoldChange = foldChange(node.data.score1, node.data.score2);
      node.data.activityChange = node.data.activity2 - node.data.activity1;

      node.data.scorePValue = pValue(node.data.scores1, node.data.scores2);
      node.data.activityPValue = pValue(node.data.activities1, node.data.activities2);
    }
    else {
      node.data.scoreFoldChange = null;
      node.data.activityChange = null;
      node.data.scorePValue = null;
      node.data.activityPValue = null;
    }
  });
};

const getNewSubgroupKey = subgroups => {
  return subgroups.reduce((max, subgroup) => {
    return Math.max(max, subgroup.key);
  }, -1) + 1;
};

const getNewSubgroupName = subgroups => {
  for (let i = subgroups.length; i < subgroups.length * 2; i++) {
    const newName = "Subgroup " + i;

    if (!subgroups.find(({ name }) => name === newName)) return newName;
  }

  return "New subgroup";
};

const filterSubgroup = (subgroup, phenotypeData, phenotypes) => {
  const filters = Array.from(group(subgroup.filters, d => d.phenotype));

  const subjects = phenotypeData.filter(subject => {
    return filters.reduce((include, filter) => {
      return include && filter[1].reduce((include, value) => {
        const v = value.value + "";
        return include || subject[value.phenotype] === v;
      }, false);    
    }, true);
  });

  const phenos = phenotypes.map(phenotype => {
    return {
      ...phenotype,
      values: phenotype.values.map(value => {
        return {
          ...value,
          count: subjects.reduce((count, subject) => {
            const v = value.value + "";
            if (subject[phenotype.name] === v) count++;
            return count;
          }, 0)
        }
      })
    };
  });

  subgroup.subjects = subjects;
  subgroup.phenotypes = phenos;
};

const createSubgroup = (name, phenotypeData, phenotypes, subgroups) => {
  const subgroup = {
    key: getNewSubgroupKey(subgroups),
    name: name,
    filters: []
  };

  filterSubgroup(subgroup, phenotypeData, phenotypes);

  return subgroup;
};

const keyIndex = (key, subgroups) => {
  return subgroups.findIndex(subgroup => subgroup.key === key);
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setDataInfo": {
      const phenotypeInfo = action.phenotypeInfo ? action.phenotypeInfo :
        action.source === "practice" ? { name: "phenotypes" } :
        { name: "unknown" };

      const expressionInfo = action.expressionInfo ? action.expressionInfo :
        action.source === "practice" ? { name: "expression data" } :
        { name: "unknown" };

      return {
        ...initialState,
        dataInfo: {
          source: action.source,
          phenotypeInfo: phenotypeInfo,
          expressionInfo: expressionInfo
        }
      };
    }

    case "setExpressionData":
      return {
        ...state,
        expressionFile: action.file,
        rawExpressionData: action.data,
        expressionData: parseExpressionData(action.data)
      };

    case "setPhenotypes": {
      const rawPhenotypeData = action.data;
      const phenotypeData = parsePhenotypeData(rawPhenotypeData);
      const phenotypes = createPhenotypes(phenotypeData);

      // Create initial group with all subjects
      const subgroups = [createSubgroup("All subjects", phenotypeData, phenotypes, [])];

      // Select this subgroup
      const selectedSubgroups = [subgroups[0].key, null];

      return {
        ...state,
        rawPhenotypeData: rawPhenotypeData,
        phenotypeData: phenotypeData,
        phenotypes: phenotypes,
        subgroups: subgroups,
        selectedSubgroups: selectedSubgroups
      };
    }

    case "setOutput": {
      const output = combineOutput(action.output.taskInfo, action.output.score, action.output.scoreBinary);
      const hierarchy = createHierarchy(output);
      const tree = createTree(hierarchy);
      updateTree(tree, state.subgroups, state.selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        rawOutput: {
          taskInfo: action.taskInfo,
          score: action.score,
          scoreBinary: action.scoreBinary
        },
        output: output,
        hierarchy: hierarchy,
        tree: tree
      };
    }   

    case "clearData":
      return {
        ...initialState
      };

    case "addSubgroup": {
      const subgroup = createSubgroup(
        getNewSubgroupName(state.subgroups), 
        state.phenotypeData, 
        state.phenotypes, 
        state.subgroups
      );

      const selectedSubgroups = state.selectedSubgroups[1] === null ?
        [state.selectedSubgroups[0], subgroup.key] : state.selectedSubgroups;

      const subgroups = [
        ...state.subgroups,
        subgroup
      ];

      updateTree(state.tree, subgroups, selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        subgroups: subgroups,
        selectedSubgroups: selectedSubgroups
      };
    }
    
    case "resetSubgroup": {
      const index = keyIndex(action.key, state.subgroups);
      
      if (index === -1) return state;

      const subgroups = state.subgroups.map((subgroup, i) => {
        if (i !== index) return subgroup;

        const reset = {
          ...subgroup,
          filters: []
        };

        filterSubgroup(reset, state.phenotypeData, state.phenotypes);

        return reset;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        subgroups: subgroups
      };
    }

    case "removeSubgroup": {
      const index = keyIndex(action.key, state.subgroups);
      
      if (index === -1) return state;

      const subgroups = [...state.subgroups];
      subgroups.splice(index, 1);

      const selectedSubgroups = [...state.selectedSubgroups];

      if (selectedSubgroups[0] === action.key) {
        selectedSubgroups[0] = subgroups[0].key;
      }

      if (selectedSubgroups[1] === action.key || selectedSubgroups[1] === selectedSubgroups[0]) {
        selectedSubgroups[1] = null;
      }

      updateTree(state.tree, subgroups, selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        subgroups: subgroups,
        selectedSubgroups: selectedSubgroups
      };
    }

    case "setSubgroupName": {
      const index = keyIndex(action.key, state.subgroups);

      if (index === -1) return state;

      const subgroups = state.subgroups.map((subgroup, i) => {
        return i === index ? {...subgroup, name: action.name} : subgroup;
      });

      return {
        ...state,
        subgroups: subgroups
      };
    }

    case "toggleSubgroupFilter": {
      const index = keyIndex(action.key, state.subgroups);

      if (index === -1 || action.value === null) return state;

      const subgroup = {...state.subgroups[index]};
      subgroup.filters = [...subgroup.filters];

      const filterIndex = subgroup.filters.findIndex(({ phenotype, value }) => {
        return phenotype === action.phenotype && value === action.value;
      });
      
      if (filterIndex === -1) {
        subgroup.filters.push({ phenotype: action.phenotype, value: action.value });
      }
      else {
        subgroup.filters.splice(filterIndex, 1);
      }     

      filterSubgroup(subgroup, state.phenotypeData, state.phenotypes);

      const subgroups = state.subgroups.map((sg, i) => {
        return i === index ? subgroup : sg;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        subgroups: subgroups
      };
    }

    case "clearSubgroupFilters": {
      const index = keyIndex(action.key, state.subgroups);

      if (index === -1) return state;

      const subgroup = {...state.subgroups[index]};

      subgroup.filters = subgroup.filters.filter(({ phenotype }) => phenotype !== action.phenotype);

      filterSubgroup(subgroup, state.phenotypeData, state.phenotypes);
      
      const subgroups = state.subgroups.map((sg, i) => {
        return i === index ? subgroup : sg;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod);

      return {
        ...state,
        subgroups: subgroups
      };
    }

    case "selectSubgroup": {
      if (action.key === null) {
        // Don't allow turning off first subgroup
        return action.which === 0 ? state :
          {
            ...state,
            selectedSubgroups: [state.selectedSubgroups[0], null]
          };
      }
      else {
        // Don't allow comparing with same subgroup
        const key1 = state.selectedSubgroups[0];
        const key2 = state.selectedSubgroups[1];

        if ((action.which === 0 && key1 === action.key) ||
            (action.which === 1 && key2 === action.key)) {
          return state;
        }

        // Check for subgroup with this key
        const subgroup = state.subgroups.find(({ key }) => key === action.key);

        if (!subgroup) return state;

        const selectedSubgroups = action.which === 0 ?
          [subgroup.key, state.selectedSubgroups[1]] :
          [state.selectedSubgroups[0], subgroup.key];

        updateTree(state.tree, state.subgroups, selectedSubgroups, state.overlapMethod);      

        return {
          ...state,
          selectedSubgroups: selectedSubgroups
        };
      }
    }

    case "setOverlapMethod":       
      updateTree(state.tree, state.subgroups, state.selectedSubgroups, action.method);

      return {
        ...state,
        overlapMethod: action.method
      };

    case "selectNode": {
      const hierarchy = [...state.hierarchy];

      const item = hierarchy.find(({ name }) => name === action.name);

      if (!item) return state;

      item.selected = action.selected;

      return {
        ...state,
        hierarchy: hierarchy
      };
    }

    case "deselectAllNodes": {
      const hierarchy = [...state.hierarchy];

      hierarchy.forEach(item => item.selected = false);

      return {
        ...state,
        hierarchy: hierarchy
      };
    }

    default: 
      throw new Error("Invalid data context action: " + action.type);
  }
}

export const DataContext = createContext(initialState);

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <DataContext.Provider value={ [state, dispatch] }>
      { children }
    </DataContext.Provider>
  )
} 
