import { createContext, useReducer } from "react";

const initialState = {
  tool: null,
  id: null,
  runtime: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setRunning":
      return {
        ...state,
        tool: action.tool,
        id: action.id,
        runtime: action.runtime
      };

    case "clearRunning":
      return {
        ...initialState
      };

    default: 
      throw new Error("Invalid running context action: " + action.type);
  }
}

export const RunningContext = createContext(initialState);

export const RunningProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <RunningContext.Provider value={ [state, dispatch] }>
      { children }
    </RunningContext.Provider>
  )
} 
