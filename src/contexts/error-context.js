import { createContext, useReducer } from "react";

const initialState = {
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setError":
      return {
        ...state,
        error: action.error
      };

    case "clearError":
      return {
        ...state,
        error: null
      };

    default: 
      throw new Error("Invalid error context action: " + action.type);
  }
}

export const ErrorContext = createContext(initialState);

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <ErrorContext.Provider value={ [state, dispatch] }>
      { children }
    </ErrorContext.Provider>
  )
} 
