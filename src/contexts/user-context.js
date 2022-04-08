import { createContext, useReducer } from "react";

const initialState = {
  user: "",
  apiKey: "",
  datasets: []
};

const getId = datasets => {
  const pending = datasets.filter(({ status }) => status === "pending");
  return pending.length === 0 ? 0 : Math.min(...pending.map(({ id }) => id));
};

const linkDatasets = datasets => {
  // Split by type
  const [inputs, results] = datasets.reduce((types, dataset) => {
    if (dataset.type === "input") types[0].push(dataset);
    else if (dataset.type === "result") types[1].push(dataset);
    return types;
  }, [[], []]);

  // Each input dataset may have many result sets
  inputs.forEach(input => input.results = []);
  results.forEach(result => result.input = null);

  // Link
  results.forEach(result => {
    const inputId = result.parameters.dataset;

    const input = inputs.find(({ id }) => id === inputId);

    if (input) {
      result.input = input;
      input.results.push(result);
    }
    else {
      console.warn(`Could not find input dataset ${ inputId } for result ${ result.id }`);
    }
  });

  return datasets;
};

const getApiKey = datasets => {
  const hasKey = datasets.filter(({ apiKey }) => apiKey).sort((a, b) => b.createdTime - a.createdTime);

  return hasKey.length > 0 ? hasKey[0].apiKey : "";
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setUser": 
      return {
        ...state,
        user: action.user
      };

    case "setApiKey":
      return {
        ...state,
        apiKey: action.apiKey
      };

    case "setDatasets":
      return {
        ...state,
        datasets: linkDatasets(action.datasets),
        apiKey: getApiKey(action.datasets)
      };

    case "addDataset": {
      const datasets = [
        {            
          id: getId(state.datasets), 
          status: "pending",
          createdTime: new Date(),
          ...action.dataset
        },
        ...state.datasets
      ];

      return {
        ...state,
        datasets: linkDatasets(datasets)
      };
    }

    case "updateDataset": {
      const index = state.datasets.findIndex(({ id }) => id === action.id);

      if (index === -1) return state;

      const datasets = [...state.datasets];
      datasets[index] = action.dataset;

      return {
        ...state,
        datasets: linkDatasets(datasets)
      };
    }   
    
    case "removeDataset": {
      const index = state.datasets.findIndex(({ id }) => id === action.dataset.id);

      if (index === -1) return state;

      const datasets = [...state.datasets];
      datasets.splice(index, 1);

      return {
        ...state,
        datasets: linkDatasets(datasets)
      }
    }

    case "setDownloads":
      return {
        ...state,
        downloads: action.downloads
      };

    case "addDownload": {
      if (state.downloads.find(({ id }) => id === action.download.id)) {
        return state;
      }

      const downloads = [...state.downloads];
      downloads.unshift(action.download);

      return {
        ...state,
        downloads: downloads
      };
    }

    case "clearUser":
      return {
        ...initialState
      };

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
