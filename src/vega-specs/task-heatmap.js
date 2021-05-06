export const taskHeatmap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: "Metabolic task heatmap",
  autosize: {
    resize: true
  },
  params: [
    {
      name: "subtitle",
      value: ""
    },
    {
      name: "depth",
      value: 3
    },
    {
      name: "value",
      value: "score"
    },
    {
      name: "sortBy",
      value: "mean",
      bind: {
        name: "Sort by: ",
        input: "select",
        options: ["mean", "median", "max"]
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
  facet: {
    column: { 
      field: "subgroup",
      title: null 
    }
  },
  spec: {  
    width: { step: 20 },
    height: { 
      step: 10 
    },
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
            title: "task phenotype"
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
            },
            legend: {
              title: { signal: "value" }
            }
          },
          stroke: { value: true },
          tooltip: [ 
            { field: "name", title: "name" },
            { field: "index", title: "subject" },
            { field: "subgroup" },
            { field: "value" }
          ]
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
            title: "task phenotype"
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
          fill: { value: "none" },  
          stroke: { 
            condition: {
              selection: "highlight",
              value: { signal: "colorScheme === 'lightgreyred' ? '#2171b5' : '#a50f15'" }
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