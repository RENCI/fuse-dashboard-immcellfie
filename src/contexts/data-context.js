import React, { createContext, useReducer } from "react";
import * as d3 from "d3";

const initialState = {
   input: null,
   output: null,
   groups: null
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

const reducer = (state, action) => {
  switch (action.type) {
    case "setInput":
      return {
        ...state,
        input: parseInput(action.file)
      };
    
    case "setOutput":
      return {
        ...state,
        output: action.fileType === "tsv" ? parseTSVOutput(action.file) : parseCSVOutput(action.file)
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
