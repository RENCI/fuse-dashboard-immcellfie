export const sequential = [
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

export const diverging = [
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

export const subgroupColors = {
  color1: "#1f77b4",
  color2: "#ff7f0e"
};