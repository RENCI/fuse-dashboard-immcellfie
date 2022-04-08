import { createContext, useReducer } from "react";

const initialState = {
  ready: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case "add": {
      if (state.ready.includes(action.id)) return state;

      return {
        ...state,
        ready: [
          ...state.ready,
          action.id
        ]
      };
    }

    case "remove": {
      const index = state.ready.findIndex(id => id === action.id);

      if (index === -1) return state;

      const ready = [...state.ready];
      ready.splice(index, 1);

      return {
        ready: ready
      };
    }
      
    case "clear":
      return {
        ...initialState
      };

    default: 
      throw new Error("Invalid ready context action: " + action.type);
  }
}

export const ReadyContext = createContext(initialState);

export const ReadyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <ReadyContext.Provider value={ [state, dispatch] }>
      { children }
    </ReadyContext.Provider>
  )
} 
