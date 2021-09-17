import React, { createContext, useReducer } from "react";

const initialState = {
  email: "",
  tasks: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEmail": 
      return {
        ...state,
        email: action.email
      }

    case "setTasks":
      return {
        ...state,
        tasks: action.tasks
      }

    default: 
      throw new Error("Invalid user context action: " + action.type);
  }
}

export const UserContext = createContext(initialState);

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <UserContext.Provider value={ [state, dispatch] }>
      { children }
    </UserContext.Provider>
  )
} 
