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
  data: {
    name: "data"
  },
  layer: [
    {
      transform: [
        {
          aggregate: [{ 
            op: "count",
            as: "count"
          }]
        },
        {
          calculate: "logSignificanceLevel",
          as: "logPValue"
        }
      ],
      mark: {
        type: "rule",
        stroke: "#ddd",
        strokeWidth: 3
      },
      encoding: {
        y: { 
          field: "logPValue",
          type: "quantitative"
        }
      }
    },
    {
      selection: {
        highlight: {
          type: "single", 
          on: "mouseover",
          empty: "none", 
          clear: "mouseout"
        }
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
            title: "-log10(p value)"
          }
        },
        size: {
          field: "depth",
          sort: "descending",
          scale: {
            domain: [3, 2, 1]
          }
        },
        stroke: {
          field: "significance",
          type: "nominal",
          scale: {
            domain: [0, 1, 2],
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
    }
  ]
};