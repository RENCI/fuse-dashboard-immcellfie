import React, { createContext, useReducer } from "react";
import * as d3 from "d3";

const initialState = {
  // Phenotype data used for grouping
  phenotypes: null,
  groups: null,

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

const applyPhenotypes = (output, phenotypes) => {
  console.log(output);
  console.log(phenotypes);
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setInput":
      return {
        ...state,
        input: parseInput(action.file)
      };

    case "setPhenotypes":
      return {
        ...state,
        phenotypes: parsePhenotypes(action.file)
      };
    
    case "setOutput":
      const output = action.fileType === "tsv" ? parseTSVOutput(action.file) : parseCSVOutput(action.file);
      const hierarchy = createHierarchy(output);
      const tree = createTree(hierarchy);

      applyPhenotypes(output, state.phenotypes);

      return {
        ...state,
        output: output,
        hierarchy: hierarchy,
        tree: tree
      };

    case "clearData":
      return {
        ...initialState
      };

    case "setGroups":
      return {
        ...state,
        groups: action.groups
      };

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
