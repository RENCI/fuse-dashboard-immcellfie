import { createContext, useReducer } from "react";
import { models, organisms, getModels } from "utils/models";

const defaultOrganism = "human";

const getOption = (value, options) => {
  return options.find(option => option.value === value);
}

const initialState = {
  organism: {
    value: defaultOrganism,
    options: organisms
  },
  model: {
    value: models.find(({ organism }) => organism === defaultOrganism),
    options: getModels(defaultOrganism)
  },
  parameters: [
    {
      label: "Threshold type",
      name: "ThreshType",
      default: "global",
      value: "global",
      options: [      
        { name: "global", value: "global" },
        { name: "local", value: "local" }
      ]
    },
    {
      label: "Percentile or value",
      name: "PercentileOrValue",    
      default: "percentile",
      value: "percentile",
      options: [
        { name: "percentile", value: "percentile" },
        { name: "value", value: "value" }
      ]
    },
    {
      label: "Percentile",
      name: "Percentile",
      type: "global",
      default: 50,
      value: 50,
      range: [0, 100]
    },
    {
      label: "Value",
      name: "Value",
      type: "global",
      default: 5,
      value: 5,
      range: [0, Number.MAX_SAFE_INTEGER]
    },
    {
      label: "Local threshold type",
      name: "LocalThresholdType",
      type: "local",
      flag: "-t",
      default: "minmaxmean",
      value: "minmaxmean",
      options: [
        { name: "min-max mean", value: "minmaxmean" }, 
        { name: "mean", value: "mean" }
      ]
    },
    {
      label: "Low percentile",
      name: "PercentileLow",
      type: "local",
      flag: "low",
      default: 25,
      value: 25,
      range: [0, 100]
    },
    {
      label: "High percentile",
      name: "PercentileHigh",
      type: "local",
      flag: "high",
      default: 75,
      value: 75,
      range: [0, 100]
    },
    {
      label: "Low value",
      name: "ValueLow",
      type: "local",
      flag: "low",
      default: 5,
      value: 5,
      range: [0, Number.MAX_SAFE_INTEGER]
    },
    {
      label: "High value",
      name: "ValueHigh",
      type: "local",
      flag: "high",
      default: 10,
      value: 10,
      range: [0, Number.MAX_SAFE_INTEGER]
    }
  ]
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setOrganism": {
      const models = getModels(action.value);
      
      return {
        ...state,
        organism: {
          ...state.organism,
          value: action.value,          
        },
        model: {
          value: models.length > 0 ? models[0] : "",
          options: models
        }
      };
    }

    case "setModel": {   
      return {
        ...state,
        model: {
          ...state.model,
          value: getOption(action.value, state.model.options)
        }
      };
    }

    case "setThresholdType":
      return {
        ...state,
        thresholdType: {
          ...state.thresholdType,
          value: getOption(action.value, state.thresholdType.options)
        }
      }

    case "setParameterValue": {
      const parameters = [...state.parameters];
      const parameter = parameters.find(({ name }) => name === action.name);

      if (!parameter) return state;

      parameter.value = action.value;

      return {
        ...state,
        parameters: parameters
      };
    }

    case "resetParameterValue": {
      const parameters = [...state.parameters];
      const parameter = parameters.find(({ name }) => name === action.name);

      if (!parameter) return state;

      parameter.value = parameter.default;

      return {
        ...state,
        parameters: parameters
      };
    }

    case "setParameters": {     
      if (!action.parameters) return state;

      const model = getOption(action.parameters.Ref, models);
      const organism = model.organism;
      const modelOptions = getModels(organism);

      return {
        ...state,
        organism: {
          ...state.organism,
          value: organism
        },
        model: {
          value: model,
          options: modelOptions
        },
        parameters: Object.entries(action.parameters)
          .filter(([key]) => key !== "Ref" && key !== "SampleNumber")
          .reduce((parameters, [key, value]) => {
            const parameter = parameters.find(({ name }) => name === key);
            
            if (parameter) parameter.value = value;

            return parameters;
          }, [...state.parameters])                 
      }
    }

    default: 
      throw new Error("Invalid model context action: " + action.type);
  }
}

export const ModelContext = createContext(initialState);

export const ModelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
 
  return (
    <ModelContext.Provider value={ [state, dispatch] }>
      { children }
    </ModelContext.Provider>
  )
} 
