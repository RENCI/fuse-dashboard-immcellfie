import React, { createContext, useReducer } from "react";

const initialState = {
   input: null,
   output: null 
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setInput":
      return {
        ...state,
        input: {...action.data}
      };
    
    case "setOutput":
      return {
        ...state,
        output: {...action.data}
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
