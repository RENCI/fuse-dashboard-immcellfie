export const taskHeatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: { 
    step: 10 
  },
  title: "Metabolic task heatmap",
  autosize: {
    resize: true
  },
  params: [
    {
      name: "value",
      value: "score",
      bind: {
        name: "Value: ",
        input: "select",
        options: ["score", "activity"]
      }
    },
    {
      name: "sortBy",
      value: "median",
      bind: {
        name: "Sort by: ",
        input: "select",
        options: ["median", "mean", "max"]
      }
    },
    {
      name: "colorScheme",
      value: "lightgreyred",
      bind: {
        name: "Color scheme: ",
        input: "select",
        options: ["lightgreyred", "yellowgreenblue"]
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
  selection: {
    highlight: {
      type: "single",
      on: "mouseover",
      empty: "none",
      clear: "mouseout"
    }
  },
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
    fill: { 
      field: "value",
      type: "quantitative",
      scale: {
        scheme: { signal: "colorScheme" },
      }
    },
    stroke: { 
      condition: {
        selection: "highlight",
        value: "#a50f15"
      },
      value: "none"
    },
    order: {
      condition: {
        selection: "highlight", 
        value: 1
      }, 
      value: 0
    }
  } 
};