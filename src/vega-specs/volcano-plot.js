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
      layer: [
        {
          selection: {
            highlight: {
              type: "single", 
              on: "mouseover",
              empty: "none", 
              clear: "mouseout"
            },            
            select: {
              type: "multi", 
              on: "click",
              empty: "none"
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
              field: "category",
              type: "nominal",
              title: "change",
              scale: {
                domain: ["not significant", "down", "up"],
                range: ["#666", "#2166ac", "#b2182b"]
              }
            },
            strokeWidth: {
              condition: [{
                selection: "highlight",
                value: 4
              },              
              {
                selection: "select",
                value: 4
              }],
              value: 2
            },
            fill: {             
              field: "category",
              type: "nominal",
              title: "change",
              scale: {
                domain: ["not significant", "down", "up"],
                range: ["#666", "#2166ac", "#b2182b"]
              }
            },
            fillOpacity: {             
              condition: {
                selection: "select",
                value: 0.8
              },
              value: 0
            },
            tooltip: [ 
              { field: "name", title: "name" },
              { field: "foldChange", title: "fold change" },
              { field: "pValue", title: "p value" }
            ]
          }
        },
        {
          mark: {
            type: "text",
            align: "center",
            baseline: "bottom",
            dy: -10
          },
          encoding: {
            x: {
              field: "logFoldChange",
              type: "quantitative",
            },
            y: {
              field: "logPValue",
              type: "quantitative",
            },
            text: {
              field: "name",
            },
            opacity: {
              condition: [{
                selection: "highlight",
                value: 1
              },              
              {
                selection: "select",
                value: 1
              }],
              value: 0
            }
          }
        }
      ]
    }
  ]
};