import React, { createContext, useReducer } from "react";

const initialState = {
  email: "",
  apiKey: "",
  downloads: [],
  tasks: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEmail": 
      return {
        ...state,
        email: action.email
      };

    case "setApiKey": {
      return {
        ...state,
        apiKey: action.apiKey
      };
    }

    case "setDownloads": {
      return {
        ...state,
        downloads: action.downloads
      };
    }

    case "setTasks":
      return {
        ...state,
        tasks: action.tasks
      };

    case "addTask": {
      const tasks = [...state.tasks];
      tasks.push({
        id: action.id, 
        isImmuneSpace: action.isImmuneSpace,
        status: action.status,
        parameters: action.parameters, 
        info: action.info
      });

      if (action.download) tasks[tasks.length -1].download = action.download;

      return {
        ...state,
        tasks: tasks
      };
    }

    case "removeTask": {
      const tasks = [...state.tasks];

      const index = tasks.findIndex(({ id }) => id === action.id);

      if (index !== -1) {
        // Remove task
        const task = tasks[index];

        tasks.splice(index, 1);

        // Set new active task if necessary
        if (task.active && tasks.length > 0) {
          tasks[0].active = true;
        }
      }

      return {
        ...state,
        tasks: tasks
      };
    }

    case "setActiveTask": {
      const tasks = [...state.tasks];
      tasks.forEach(task => task.active = task.id === action.id);

      return {
        ...state,
        tasks: tasks
      };
    }

    case "clearActiveTask": {
      const tasks = [...state.tasks];
      tasks.forEach(task => task.active = false);

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

    case "setInfo": {
      const tasks = [...state.tasks];
      const task = state.tasks.find(({ id }) => id === action.id);

      if (task) task.info = action.info;

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
