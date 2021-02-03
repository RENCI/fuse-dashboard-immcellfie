export const heatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: { step: 5 },
  autosize: {
    resize: true
  },
  data: {
    name: "data"
  },
  mark: { 
    type: "rect",
    tooltip: true
  },
  encoding: {
    y: {
      field: "gene", 
      type: "ordinal",
      axis: null,
      sort: {
        op: "median",
        field: "value",
        order: "descending"
      }
    },
    x: {
      field: "id", 
      type: "ordinal",
      axis: {
        orient: "top"
      },
      scale: {
        round: true
      }
    },
    color: { 
      field: "value",
      type: "quantitative",
      scale: {
        type: "symlog"
      }
    }
  }
};