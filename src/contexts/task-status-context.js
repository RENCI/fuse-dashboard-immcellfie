import React, { createContext, useReducer } from "react";

const initialState = {
  status: null,
  elapsedTime: -1
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setStatus": 
      return {
        ...state,
        status: action.status
      }

    default: 
      throw new Error("Invalid task status context action: " + action.type);
  }
}

export const TaskStatusContext = createContext(initialState);

export const TaskStatusProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <TaskStatusContext.Provider value={ [state, dispatch] }>
      { children }
    </TaskStatusContext.Provider>
  )
} 
