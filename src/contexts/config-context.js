import { createContext, useReducer, useEffect, useContext } from "react";
import { ErrorContext } from "contexts";
import { api } from "utils/api";

const initialState = {
  providers: [],
  tools: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setProviders":
      return {
        ...state,
        providers: action.providers
      };

    case "setTools":
      return {
        ...state,
        tools: action.tools
      };

    default: 
      throw new Error("Invalid config context action: " + action.type);
  }
}

export const ConfigContext = createContext(initialState);

export const ConfigProvider = ({ children }) => {
  const [, errorDispatch] = useContext(ErrorContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const getConfig = async () => {
      try {
        const providers = await api.getProviders();
        const tools = await api.getTools();

        dispatch({ type: "setProviders", providers: providers });
        dispatch({ type: "setTools", tools: tools });
      }
      catch (error) {
        console.log(error);

        errorDispatch({ type: "setError", error: error });
      }
    };

    getConfig();
  }, []);
 
  return (
    <ConfigContext.Provider value={ [state, dispatch] }>
      { children }
    </ConfigContext.Provider>
  )
} 
