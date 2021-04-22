import React, { createContext, useReducer } from "react";
import * as d3 from "d3";
import { filter } from "d3";

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
  // Phenotype data for each subject
  phenotypeData: null,

  // Phenotype options created from phenotype data
  phenotypes: null,

  // Subgroups
  subgroups: null,

  // Expression data used as CellFIE input
  input: null,

  // CellFIE output
  output: null,

  // CellFIE output with hierarchy info
  hierarchy: null,

  // CellFIE output in tree format, used for aggregating info and for the Voronoi treemap,
  // since we have to calculate the layout external to the Vega spec
  tree: null
};

const parseInput = data => {
  return {
    data: d3.tsvParseRows(data, row => {
      return {
        gene: row[0],
        values: row.slice(1).map(d => +d)
      };
    })
  };
};

const parseNumber = d => d < 0 ? NaN : +d;

const parseTSVOutput = data => {
  return {
    tasks: d3.tsvParseRows(data, row => {
      if (row.length !== 3) return null;

      const info = d3.csvParseRows(row[0])[0];

      // Reorder phenotype info to go from task to system
      const phenotype = [info[1], info[3], info[2]];

      const scores = d3.csvParseRows(row[1])[0].map(parseNumber);

      return {
        id: info[0],
        name: info[1],        
        phenotype: phenotype,
        scores: scores,
        activities: d3.csvParseRows(row[2])[0].map(parseNumber)
      };
    })
  };
};

const parsePhenotypes = data => d3.csvParse(data);

const parseCSVOutput = data => {
  return {
    tasks: d3.csvParseRows(data, (row, i) => {
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

const createPhenotypes = phenotypeData => {
  const shortLabel = value => value.length > 10 ? value.substr(0, 10) + "..." : value;

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

      // Short label for graph
      values.forEach(value => {
        value.shortLabel = numeric ? value.value : shortLabel(value.value);
      });

      return {
        name: column,
        values: values
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
  const tree = d3.stratify()
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

    node.data.scores = node.data.allScores.map(d => d3.mean(d));
    node.data.score = d3.mean(d3.merge(node.data.allScores));

    node.data.activities = node.data.allActivities.map(d => d3.mean(d));
    node.data.activity = d3.mean(d3.merge(node.data.allActivities));

/*    
    // Compute fold change
    if (groups) {
      const group0Score = d3.mean(d3.merge(node.data.allScores.filter((scores, i) => {
        return groups[i].number === 0;
      })));

      const group1Score = d3.mean(d3.merge(node.data.allScores.filter((scores, i) => {
        return groups[i].number === 1;
      })));

      node.data.scoreFoldChange = Math.pow(group0Score / group1Score, 2);
      node.data.activityFoldChange = 1;
    }
    else {
      node.data.scoreFoldChange = 1;
      node.data.activityFoldChange = 1;
    }
*/    

    node.data.subjects = d3.range(0, node.data.scores.length);
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
  const subjects = phenotypeData.filter(subject => {
    return subgroup.filters.reduce((include, filter) => {
      return include && subject[filter.phenotype] == filter.value;
    }, true);
  });

  const phenos = phenotypes.map(phenotype => {
    return {
      ...phenotype,
      values: phenotype.values.map(value => {
        return {
          ...value,
          count: subjects.reduce((count, subject) => {
            if (subject[phenotype.name] == value.value) count++;
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
    case "setInput":
      return {
        ...state,
        input: parseInput(action.file)
      };

    case "setPhenotypes": {
      const phenotypeData = parsePhenotypes(action.file);
      const phenotypes = createPhenotypes(phenotypeData);

      // Create initial group with all subjects
      const subgroups = [createSubgroup("All", phenotypeData, phenotypes, [])];

      return {
        ...state,
        phenotypeData: phenotypeData,
        phenotypes: phenotypes,
        subgroups: subgroups
      };
    }
    
    case "setOutput": {
      const output = action.fileType === "tsv" ? parseTSVOutput(action.file) : parseCSVOutput(action.file);
      const hierarchy = createHierarchy(output);
      const tree = createTree(hierarchy);

      return {
        ...state,
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
        getNewSubgroupName(state.subgroups), state.phenotypeData, state.phenotypes, state.subgroups
      );

      return {
        ...state,
        subgroups: [
          ...state.subgroups,
          subgroup
        ]
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

      return {
        ...state,
        subgroups: subgroups
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

    case "setSubgroupFilter": {
      const index = keyIndex(action.key, state.subgroups);

      if (index === -1) return state;

      const subgroup = {...state.subgroups[index]};
      const filterIndex = subgroup.filters.findIndex(({ phenotype }) => phenotype === action.phenotype);

      if (filterIndex !== -1) subgroup.filters.splice(filterIndex, 1);

      if (action.value !== null) subgroup.filters.push({ phenotype: action.phenotype, value: action.value });

      filterSubgroup(subgroup, state.phenotypeData, state.phenotypes);

      const subgroups = state.subgroups.map((sg, i) => {
        return i === index ? subgroup : sg;
      });

      return {
        ...state,
        subgroups: subgroups
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
