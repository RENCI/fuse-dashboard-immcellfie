export const taskHeatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: { step: 10 },
  title: "Metabolic task heatmap",
  autosize: {
    resize: true
  },
  params: [
    {
      name: "value",
      value: "score",
      bind: {
        input: "select",
        options: ["score", "activity"]
      }
    },
    {
      name: "sortBy",
      value: "median",
      bind: {
        input: "select",
        options: ["median", "mean", "max", "min"]
      }
    }
  ],
  data: {
    name: "data"
  },
  transform: [
    {
      calculate: "datum[value]",
      as: "value"
    }
  ],
  mark: { 
    type: "rect",
    tooltip: true
  },
  encoding: {
    y: {
      field: "task", 
      type: "ordinal",
      sort: {
        op: { signal: "sortBy" },
        field: "score",
        order: "descending"
      }
    },
    x: {
      field: "gene", 
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
      type: "quantitative"
    }
  } 
};