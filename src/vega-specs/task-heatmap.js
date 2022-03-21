export const taskHeatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: "Metabolic task heatmap",
  autosize: {
    resize: true
  },
  params: [    
    {
      name: "value",
      value: "score"
    },
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    { 
      name: "reverseColors",
      value: false
    },
    {
      name: "highlightColor",
      value: "#2171b5",
    },
    {
      name: "inconclusiveColor",
      value: "#c6dbef",
    },
    {
      name: "sortBy",
      value: "mean"
    }
  ],
  data: {
    name: "data"
  },
  facet: {
    column: { 
      field: "subgroup",
      title: null 
    }
  },
  spec: {  
    width: { step: 20 },
    height: { step: 10 },
    layer: [
      {
        mark: { 
          type: "rect"
        },
        encoding: {
          y: {
            field: "name", 
            type: "ordinal",
            sort: {
              op: { signal: "sortBy" },
              field: "value",
              order: "descending"
            },
            title: "task properties"
          },
          x: {
            field: "index", 
            type: "ordinal",
            axis: {
              title: null,
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
              scheme: { signal: "colorScheme" },
              reverse: { signal: "reverseColors" }
            },
            legend: {
              title: { signal: "value" }
            }
          },
          stroke: { value: true },
          tooltip: [ 
            { field: "name", title: "name" },
            { field: "index", title: "sample" },
            { field: "subgroup" },
            { field: "value" }
          ]
        } 
      },
      {    
        selection: {
          highlightRow: {
            type: "single",
            on: "mouseover",
            empty: "none"
          }
        },
        mark: { 
          type: "rect"
        },
        encoding: {
          y: {
            field: "name", 
            sort: {
              op: { signal: "sortBy" },
              field: "value",
              order: "descending"
            }
          },
          fill: { value: "none" },  
          stroke: { 
            condition: {
              selection: "highlightRow",
              value: { signal: "highlightColor" }
            }
          }          
        } 
      },
      {    
        selection: {
          highlightColumn: {
            type: "single",
            on: "mouseover",
            empty: "none"
          }
        },
        mark: { 
          type: "rect"
        },
        encoding: {
          x: {
            field: "index", 
            type: "ordinal",
            axis: {
              title: null,
              orient: "top"
            },
            scale: {
              round: true
            }
          },
          fill: { value: "none" },  
          stroke: { 
            condition: {
              selection: "highlightColumn",
              value: { signal: "highlightColor" }
            },
            
          }          
        } 
      }
    ]
  },
  resolve: {
    scale: { x: "independent" }
  }  
};