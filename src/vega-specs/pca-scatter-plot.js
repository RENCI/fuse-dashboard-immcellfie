export const pcaScatterPlot = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: "container",
  title: { 
    text: "PCA scatter plot"
  },
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "xTitle",
      value: "x"
    },
    {
      name: "yTitle",
      value: "y"
    },
    {
      name: "colors",
      value: ["purple", "black"]
    }
  ],
  data: {
    name: "data"
  },
  mark: {
    type: "point",
    tooltip: true
  },
  encoding: {
    x: {
      field: "x", 
      type: "quantitative",
      scale: {
        zero: false
      },
      axis: {
        title: { signal: "xTitle" }
      }
    },
    y: {
      field: "y", 
      type: "quantitative",
      scale: {
        zero: false
      },
      axis: {
        title: { signal: "yTitle" }
      }
    },
    color: {
      field: "subgroup",
      type: "nominal",
      scale: { 
        range: { field: "color" }
      }
    }
  }
};