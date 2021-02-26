export const density = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: "Distribution",
  height: 50,
  autosize: {
    type: "pad",
    resize: true
  },
  data: {
    name: "data"
  },
  layer: [{
    transform:[{
      density: "value",
      bandwidth: 0.3
    }],
    mark: "area",
    encoding: {
      x: {
        field: "value",
        type: "quantitative"
      },
      y: {
        field: "density",
        type: "quantitative"
      }
    }
  },
  {
    mark: "rule",
    encoding: {
      x: {
        aggregate: "mean", 
        field: "value"
      },
      color: {
        value: "#b30000"
      },
      size: {
        value: 3
      }
    }
  }]
};