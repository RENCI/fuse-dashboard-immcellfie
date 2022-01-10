import { createContext, useReducer, useEffect } from "react";
import * as vega from "vega";

const sequential = [
  { 
    name: "light grey → red",
    scheme: "lightgreyred" ,
    highlight: "#2171b5",
    inconclusive: "#c6dbef"
  },
  { 
    name: "yellow → green → blue", 
    scheme: "yellowgreenblue",
    highlight: "#a50f15",
    inconclusive: "#c6dbef" 
  }
];

const diverging = [
  { 
    name: "blue ↔ orange", 
    scheme: "blueorange", 
    highlight: "#a50f15",
    inconclusive: "#ccc"
  },
  { 
    name: "blue ↔ red", 
    scheme: "redblue", 
    reverse: true, 
    highlight: "#006d2c",
    inconclusive: "#ccc"
  },
  { 
    name: "grey ↔ red", 
    scheme: "redgrey", 
    reverse: true, 
    highlight: "#006d2c",
    inconclusive: "#c6dbef"
  }
];

const getColorScale = (name, scales) => scales.find(({ scheme }) => scheme === name);
const getSubgroupColors = colorScale => {
  const scheme = vega.scheme(colorScale.scheme);

  return [scheme(0.1), scheme(0.9)];
}

const initialState = {
  sequentialScales: sequential,
  divergingScales: diverging,
  sequentialScale: sequential[0],
  divergingScale: diverging[0],
  subgroupColors: getSubgroupColors(diverging[0])
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setColorScale":
      if (action.scaleType === "sequential") {
        return {
          ...state,
          sequentialScale: getColorScale(state.sequentialScales, action.name)
        }
      }
      else {
        const scale = getColorScale(state.divergingScales, action.name);

        return {
          ...state,
          divergingScale: scale,
          subgroupColors: getSubgroupColors(scale)
        }
      }

    default: 
      throw new Error("Invalid color context action: " + action.type);
  }
}

export const ColorContext = createContext(initialState);

export const ColorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    vega.scheme("TEST", ["black", "gold"]);
  }, []);
 
  return (
    <ColorContext.Provider value={ [state, dispatch] }>
      { children }
    </ColorContext.Provider>
  )
} 
