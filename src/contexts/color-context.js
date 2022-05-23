import { createContext, useReducer, useEffect } from "react";
import * as vega from "vega";

// Taken from vega-scale/src/pallettes.js
const lightGreyRed = "efe9e6e1dad7d5cbc8c8bdb9bbaea9cd967ddc7b43e15f19df4011dc000b";
const yellowGreenBlue = "eff9bddbf1b4bde5b594d5b969c5be45b4c22c9ec02182b82163aa23479c1c3185";
const blueOrange = "134b852f78b35da2cb9dcae1d2e5eff2f0ebfce0bafbbf74e8932fc5690d994a07";
const redBlue = "8c0d25bf363adf745ef4ae91fbdbc9f2efeed2e5ef9dcae15da2cb2f78b3134b85";
const redGrey = "8c0d25bf363adf745ef4ae91fcdccbfaf4f1e2e2e2c0c0c0969696646464343434";

const scaleValues = scale => scale.match(/.{1,6}/g).map(value => "#" + value);

const sequential = [
  { 
    name: "light grey → red",
    scheme: "lightgreyred" ,
    highlight: "#2171b5",
    inconclusive: "#c6dbef",
    values: scaleValues(lightGreyRed)
  },
  { 
    name: "yellow → green → blue", 
    scheme: "yellowgreenblue",
    highlight: "#a50f15",
    inconclusive: "#c6dbef",
    values: scaleValues(yellowGreenBlue)
  }
];

const diverging = [
  { 
    name: "blue ↔ orange", 
    scheme: "blueorange", 
    highlight: "#a50f15",
    inconclusive: "#ccc",
    values: scaleValues(blueOrange)
  },
  { 
    name: "blue ↔ red", 
    scheme: "redblue", 
    reverse: true, 
    highlight: "#006d2c",
    inconclusive: "#ccc",
    values: scaleValues(redBlue).reverse()
  },
  { 
    name: "grey ↔ red", 
    scheme: "redgrey", 
    reverse: true, 
    highlight: "#006d2c",
    inconclusive: "#c6dbef",
    values: scaleValues(redGrey).reverse()
  }
];

const getColorScale = (scales, name) => scales.find(({ scheme }) => scheme === name);
const getSubgroupColors = colorScale => {
  const scheme = vega.scheme(colorScale.scheme);
  const colors = [scheme(0.1), scheme(0.9)];
  
  return colorScale.reverse ? colors.reverse() : colors;
};

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
        const subgroupColors = getSubgroupColors(scale);

        vega.scheme("subgroup", subgroupColors);

        return {
          ...state,
          divergingScale: scale,
          subgroupColors: subgroupColors
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
    vega.scheme("subgroup", getSubgroupColors(diverging[0]));
  }, []);
 
  return (
    <ColorContext.Provider value={ [state, dispatch] }>
      { children }
    </ColorContext.Provider>
  )
} 
