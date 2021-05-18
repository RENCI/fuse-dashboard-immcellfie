export const volcanoPlot = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: "container",
  title: { 
    text: "Volcano plot",
    subtitle: { signal: "subtitle" }
  },
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "subtitle",
      value: ""
    },
    {
      name: "logFoldChangeExtent",
      value: 1
    },
    {
      name: "logPValueExtent",
      value: 1
    },
    {
      name: "logSignificanceLevel",
      value: 1
    },
    {
      name: "logFoldChangeThreshold",
      value: 0.2
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
      transform: [
        {
          aggregate: [{ 
            op: "count",
            as: "count"
          }]
        },
        {
          calculate: "logFoldChangeThreshold",
          as: "logFoldChange"
        },
      ],
      mark: {
        type: "rule",
        stroke: "#ddd",
        strokeWidth: 3
      },
      encoding: {
        x: { 
          field: "logFoldChange",
          type: "quantitative"
        }
      }
    },
    {
      transform: [
        {
          aggregate: [{ 
            op: "count",
            as: "count"
          }]
        },
        {
          calculate: "-logFoldChangeThreshold",
          as: "logFoldChange"
        },
      ],
      mark: {
        type: "rule",
        stroke: "#ddd",
        strokeWidth: 3
      },
      encoding: {
        x: { 
          field: "logFoldChange",
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
              type: "single",
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
                domainMin: { expr: "-logFoldChangeExtent" },
                domainMax: { expr: "logFoldChangeExtent" }
              },
              axis: {
                title: "log10(fold change)"
              }
            },
            y: {
              field: "logPValue",
              type: "quantitative",
              scale: {
                domainMin: 0,
                domainMax: { expr: "logPValueExtent" }                
              },
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
              title: "regulation",
              scale: {
                domain: ["not significant", "down", "up"],
                range: ["#999", "#2166ac", "#b2182b"]
              }
            },
            strokeWidth: {
              condition: [
                {
                  selection: "highlight",
                  value: 4
                },              
                {
                  selection: "select",
                  value: 4
                }
              ],
              value: 2
            },
            fill: {             
              field: "category",
              type: "nominal",
              title: "regulation",
              scale: {
                domain: ["not significant", "down", "up"],
                range: ["#999", "#2166ac", "#b2182b"]
              }
            },
            fillOpacity: {             
              condition: [
                {
                  selection: "select",
                  value: 0.8
                },
                {
                  test: "datum.category !== 'not significant'",
                  value: 0.8
                }
              ],
              value: 0
            },
            tooltip: [ 
              { field: "name", title: "name" },
              { field: "foldChange", title: "fold change" },
              { field: "pValue", title: "p-value" }
            ]
          }
        },
        {
          mark: {
            type: "text",
            align: "center",
            baseline: "bottom",
            dy: -10,
            limit: 200
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
              condition: [
                {
                  selection: "highlight",
                  value: 1
                },              
                {
                  selection: "select",
                  value: 1
                },
                {
                  test: "datum.category !== 'not significant'",
                  value: 1
                }
              ],              
              value: 0
            }
          }
        }
      ]
    }
  ]
};