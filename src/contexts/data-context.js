import { createContext, useReducer } from "react";
import { csvParseRows, csvParse } from "d3-dsv";
import { stratify } from "d3-hierarchy";
import { merge, mean, group } from "d3-array";
import ttest2 from "@stdlib/stats/ttest2";

const excludedproperties = [
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
  // Current datasets
  dataset: null,
  result: null,

  // Properties data for each sample
  rawPropertiesData: null,
  propertiesData: null,

  // Properties options created from properties data
  properties: null,

  // Subgroups
  subgroups: null,

  // Subgroups selected for visualization
  selectedSubgroups: null,

  // Expression data used as CellFIE input
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

  // Reaction scores from detailed CellFIE output
  reactionScores: null,  

  // Method for handling subgroup overlap
  overlapMethod: "both"
};

const parseExpressionData = data => {
  return csvParseRows(data, row => {
    // Check for header
    if (row[0] === "genes") return null;

    return {
      gene: row[0],
      values: row.slice(1).map(d => +d)
    };
  });
};

const parseNumber = d => d < 0 ? NaN : +d;

/*
const parsePropertiesDataRandomize = (data, n = 32) => {
  const csv = csvParse(data);

  const random = randomInt(csv.length);

  const result = [];

  for (let i = 0; i < n; i++) {
    const sample = csv[random()];

    sample.index = i;

    result.push({...sample});
  }

  result.columns = csv.columns;

  return result;
}
*/

const createPropertiesData = expressionData => {
  return expressionData.length === 0 ? "" :
    "ID\n" + expressionData[0].values.map((value, i) => i).join("\n");
};

const initializePropertiesData = (state, rawPropertiesData) => {
  const propertiesData = parsePropertiesData(rawPropertiesData);
  const properties = createproperties(propertiesData);

  // Create initial group with all samples
  const subgroups = [createSubgroup("All samples", propertiesData, properties, [])];

  // Select this subgroup
  const selectedSubgroups = [subgroups[0].key, null];

  return {
    ...state,
    rawPropertiesData: rawPropertiesData,
    propertiesData: propertiesData,
    properties: properties,
    subgroups: subgroups,
    selectedSubgroups: selectedSubgroups
  };
}

const parsePropertiesData = data => {
  const csv = csvParse(data);

  csv.forEach((sample, i) => sample.index = i);

  return csv;
};

const combineOutput = (taskInfo, score, scoreBinary) => {
  const taskInfoParsed = csvParseRows(taskInfo).slice(1);
  const scoreParsed = csvParseRows(score);
  const scoreBinaryParsed = csvParseRows(scoreBinary);

  return {
    tasks: taskInfoParsed.map((task, i) => {
      return {
        id: task[0],
        name: task[1],        
        properties: [task[1], task[3], task[2]],
        scores: scoreParsed[i].map(parseNumber),
        activities: scoreBinaryParsed[i].map(parseNumber)
      };  
    })
  }
};

const getReactionScores = detailScoring => {
  const cols = 8;
  const idCol = 4;
  const scoreCol = 5;

  const csv = csvParseRows(detailScoring);

  if (csv.length === 0) return null;

  const n = csv[0].length / cols;

  const scores = new Array(n).fill().map(() => ({}));

  csv.forEach((row, i) => {
    if (i === 0) return;

    scores.forEach((sample, j) => {
      const offset = j * cols;

      sample[row[offset + idCol]] = +row[offset + scoreCol];
    });
  });

  return scores;
};

const setReactionScores = (subgroup, samples, reactionScores) => {
  if (!subgroup) return;

  if (samples.length === 0) {
    subgroup.reactionScores = null;
    return;
  }

  const scores = reactionScores.filter((scores, i) => {
    return samples.find(({ index }) => index === i);
  });

  subgroup.reactionScores = Object.keys(scores[0]).reduce((aggregate, key) => {
    aggregate[key] = mean(scores, d => d[key]);

    return aggregate;
  }, {});
}

const createproperties = propertiesData => {
  return propertiesData.columns
    .filter(column => !excludedproperties.includes(column))
    .map(column => {
      const values = propertiesData.reduce((values, row) => {
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
    // Add nodes for properties
    task.properties.forEach((name, i, a) => { 
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
      const parent = task.properties[0];
      const id = parent + "_" + i;

      data[id] = {
        index: i,
        name: "sample " + i,
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
      node.data.properties = [];

      return;
    }

    node.data.properties = node.parent.data.properties.concat(node.data.name);  
  });

  return tree;
};

const getSubgroup = (key, subgroups) => key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;

const subgroupContains = (subgroup, index) => subgroup && subgroup.samples.some(sample => sample.index === index);

const updateTree = (tree, subgroups, selectedSubgroups, overlapMethod, reactionScores) => {
  if (!tree) return;

  // Get subgroups
  const subgroup1 = getSubgroup(selectedSubgroups[0], subgroups);
  const subgroup2 = getSubgroup(selectedSubgroups[1], subgroups);

  const getSamples = (subgroup, other, which) => {
    return !subgroup ? [] : subgroup.samples.filter(({ index }) => { 
      const conflict = () => other && other.samples.find(sample => sample.index === index);

      return overlapMethod === "both" ? true : 
        overlapMethod === "neither" && conflict() ? false :
        overlapMethod === which ? true :
        conflict() ? false :
        true;
    });
  };

  const samples1 = getSamples(subgroup1, subgroup2, "subgroup1");
  const samples2 = getSamples(subgroup2, subgroup1, "subgroup2");

  // Set reaction scores for subgroups
  if (reactionScores) {
    setReactionScores(subgroup1, samples1, reactionScores);
    setReactionScores(subgroup2, samples2, reactionScores);
  }

  tree.each(node => {
    // Check if it is a leaf node (single sample)
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
    const processSubgroup = (samples, which) => {
      if (samples.length === 0) {
        node.data["scores" + which] = [];
        node.data["score" + which] = null;
        node.data["activities" + which] = [];
        node.data["activity" + which] = null;        
      }
      else {
        const getValues = arrayName => {
          return merge(samples.map(({ index }) => {
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

    processSubgroup(samples1, 1);
    processSubgroup(samples2, 2);

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

const filterSubgroup = (subgroup, propertiesData, properties) => {
  const filters = Array.from(group(subgroup.filters, d => d.properties));

  const samples = propertiesData.filter(sample => {
    return filters.reduce((include, filter) => {
      return include && filter[1].reduce((include, value) => {
        const v = value.value + "";
        return include || sample[value.properties] === v;
      }, false);    
    }, true);
  });

  const phenos = properties.map(properties => {
    return {
      ...properties,
      values: properties.values.map(value => {
        return {
          ...value,
          count: samples.reduce((count, sample) => {
            const v = value.value + "";
            if (sample[properties.name] === v) count++;
            return count;
          }, 0)
        }
      })
    };
  });

  subgroup.samples = samples;
  subgroup.properties = phenos;
};

const createSubgroup = (name, propertiesData, properties, subgroups) => {
  const subgroup = {
    key: getNewSubgroupKey(subgroups),
    name: name,
    filters: []
  };

  filterSubgroup(subgroup, propertiesData, properties);

  return subgroup;
};

const keyIndex = (key, subgroups) => {
  return subgroups.findIndex(subgroup => subgroup.key === key);
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setDataset":
      return {
        ...initialState,
        dataset: action.dataset
      };

    case "setResult":
      return {
        ...state,
        result: action.result
      };

    case "setExpressionData":
      const expressionData = parseExpressionData(action.data);

      let newState = {...state};

      if (!state.propertiesData) {
        newState = initializePropertiesData(newState, createPropertiesData(expressionData));
      }

      return {
        ...newState,
        expressionFile: action.file,
        rawExpressionData: action.data,
        expressionData: parseExpressionData(action.data)
      };

    case "setEmptyProperties":
      return initializePropertiesData(state, "");

    case "setProperties":
      return initializePropertiesData(state, action.data);

    case "setOutput": {
      if (!state.subgroups || !state.selectedSubgroups) return state;

      const output = combineOutput(action.output.taskInfo, action.output.score, action.output.scoreBinary);
      const hierarchy = createHierarchy(output);
      const tree = createTree(hierarchy);
      const reactionScores = null;

      updateTree(tree, state.subgroups, state.selectedSubgroups, state.overlapMethod, reactionScores);

      return {
        ...state,
        rawOutput: {...action.output},
        output: output,
        hierarchy: hierarchy,
        tree: tree,
        reactionScores: reactionScores
      };
    }   

    case "setDetailScoring": {
      const reactionScores = getReactionScores(action.data);
      updateTree(state.tree, state.subgroups, state.selectedSubgroups, state.overlapMethod, reactionScores);

      return {
        ...state,
        rawOutput: {
          ...state.rawOutput,
          detailScoring: action.data
        },
        reactionScores: reactionScores
      };
    }   

    case "clearData":
      return {
        ...initialState
      };

    case "clearOutput":
      return {
        ...state,
        rawOutput: null,
        output: null,
        hierarchy: null,
        tree: null,
        reactionScores: null
      };

    case "createSubgroups": {
      const subgroups = [...state.subgroups];
      const newSubgroups = [];

      action.properties.values.forEach(({ value }) => {
        const subgroup = createSubgroup(
          value,
          state.propertiesData,
          state.properties,
          subgroups
        );

        subgroup.filters.push({ properties: action.properties.name, value: value });
        filterSubgroup(subgroup, state.propertiesData, state.properties);

        subgroups.push(subgroup);
        newSubgroups.push(subgroup);
      });

      const selectedSubgroups = [newSubgroups[0].key, newSubgroups.length > 1 ? newSubgroups[1].key : null];

      updateTree(state.tree, subgroups, selectedSubgroups, state.overlapMethod, state.reactionScores);

      return {
        ...state,
        subgroups: subgroups,
        selectedSubgroups: selectedSubgroups
      }
    }

    case "addSubgroup": {
      const subgroup = createSubgroup(
        getNewSubgroupName(state.subgroups), 
        state.propertiesData, 
        state.properties, 
        state.subgroups
      );

      const selectedSubgroups = state.selectedSubgroups[1] === null ?
        [state.selectedSubgroups[0], subgroup.key] : state.selectedSubgroups;

      const subgroups = [
        ...state.subgroups,
        subgroup
      ];

      updateTree(state.tree, subgroups, selectedSubgroups, state.overlapMethod, state.reactionScores);

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

        filterSubgroup(reset, state.propertiesData, state.properties);

        return reset;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod, state.reactionScores);

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

      updateTree(state.tree, subgroups, selectedSubgroups, state.overlapMethod, state.reactionScores);

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

      const filterIndex = subgroup.filters.findIndex(({ properties, value }) => {
        return properties === action.properties && value === action.value;
      });
      
      if (filterIndex === -1) {
        subgroup.filters.push({ properties: action.properties, value: action.value });
      }
      else {
        subgroup.filters.splice(filterIndex, 1);
      }     

      filterSubgroup(subgroup, state.propertiesData, state.properties);

      const subgroups = state.subgroups.map((sg, i) => {
        return i === index ? subgroup : sg;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod, state.reactionScores);

      return {
        ...state,
        subgroups: subgroups
      };
    }

    case "clearSubgroupFilters": {
      const index = keyIndex(action.key, state.subgroups);

      if (index === -1) return state;

      const subgroup = {...state.subgroups[index]};

      subgroup.filters = subgroup.filters.filter(({ properties }) => properties !== action.properties);

      filterSubgroup(subgroup, state.propertiesData, state.properties);
      
      const subgroups = state.subgroups.map((sg, i) => {
        return i === index ? subgroup : sg;
      });

      updateTree(state.tree, subgroups, state.selectedSubgroups, state.overlapMethod, state.reactionScores);

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

        updateTree(state.tree, state.subgroups, selectedSubgroups, state.overlapMethod, state.reactionScores);      

        return {
          ...state,
          selectedSubgroups: selectedSubgroups
        };
      }
    }

    case "setOverlapMethod":       
      updateTree(state.tree, state.subgroups, state.selectedSubgroups, action.method, state.reactionScores);

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
