export const histogram = {
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
    mark: "bar",
    encoding: {
      x: {
        field: "value",
        bin: true
      },
      y: {
        aggregate: "count"
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