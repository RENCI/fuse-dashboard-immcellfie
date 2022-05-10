import { createContext, useReducer } from "react";

const initialState = {
  running: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setRunning":
      return {
        ...state,
        running: action.running
      };

    case "clearRunning":
      return {
        ...state,
        running: null
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
