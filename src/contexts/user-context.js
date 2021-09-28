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
      };

    case "setTasks":
      return {
        ...state,
        tasks: action.tasks
      };

    case "setActiveTask": {
      const tasks = [...state.tasks];
      tasks.forEach(task => task.active = task.id === action.id);

      return {
        ...state,
        tasks: tasks
      };
    }

    case "setStatus": {
      const tasks = [...state.tasks];
      const task = state.tasks.find(({ id }) => id === action.id);

      if (task) task.status = action.status;

      return {
        ...state,
        tasks: tasks
      };
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