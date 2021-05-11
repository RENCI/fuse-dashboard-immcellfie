export const volcanoPlot = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 500,
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "foldChangeExtent",
      value: 1
    },
    {
      name: "logSignificanceLevel",
      value: 2
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
  data: {
    name: "data"
  },
  mark: "point",
  encoding: {
    x: {
      field: "logFoldChange",
      type: "quantitative",
      scale: {
        domainMin: { expr: "-foldChangeExtent" },
        domainMax: { expr: "foldChangeExtent" }
      },
      axis: {
        title: "log10(fold change)",
        gridWidth: {
          condition: {
            test: "datum.value === 0", 
            value: 3
          },
          value: 1
        }
      }
    },
    y: {
      field: "logPValue",
      type: "quantitative",
      axis: {
        title: "-log10(p value)",
        gridWidth: {
          condition: {
            test: "datum.value === logSignificanceLevel", 
            value: 3
          },
          value: 1
        }
      }
    },
    size: {
      field: "depth",
      sort: "descending"
    },
    stroke: {
      field: "significance",
      type: "nominal",
      scale: {
        range: ["#666", "#2166ac", "#b2182b"]
      }
    },
    strokeWidth: {
      condition: {
        selection: "highlight",
        value: 4
      },
      value: 2
    },
    tooltip: [ 
      { field: "name", title: "name" },
      { field: "foldChange", title: "fold change" },
      { field: "pValue", title: "p value" }
    ]
  }
};