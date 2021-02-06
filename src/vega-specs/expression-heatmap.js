export const expressionHeatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: { step: 2 },
  title: "Gene expression heat map",
  autosize: {
    resize: true
  },
  params: [
    {
      name: "sortBy",
      value: "median",
      bind: {
        input: "select",
        options: ["median", "mean", "max"]
      }
    }
  ],
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
        op: { signal: "sortBy" },
        field: "value",
        order: "descending"
      }
    },
    x: {
      field: "patient", 
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