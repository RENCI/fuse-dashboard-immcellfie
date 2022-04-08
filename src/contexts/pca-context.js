import { createContext, useReducer } from "react";

const initialState = {
  numComponents: 3,
  description: ""
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setNumComponents":
      return {
        ...state,
        numComponents: action.numComponents
      };

    case "setDescription":
      return {
        ...state,
        description: action.description
      };

    default: 
      throw new Error("Invalid PCA context action: " + action.type);
  }
}

export const PCAContext = createContext(initialState);

export const PCAProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <PCAContext.Provider value={ [state, dispatch] }>
      { children }
    </PCAContext.Provider>
  )
} 
