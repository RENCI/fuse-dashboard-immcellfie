export const pcaScatterPlot = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: "container",
  title: { 
    text: "PCA scatter plot",
    subtitle: { signal: "subtitle" }
  },
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "subtitle",
      value: ""
    }
  ],
  data: {
    name: "data"
  },
  mark: "point",
  encoding: {
    x: {
      field: "x", 
      type: "quantitative",
      scale: {
        zero: false
      }
    },
    y: {
      field: "y", 
      type: "quantitative",
      scale: {
        zero: false
      }
    }
  }
};