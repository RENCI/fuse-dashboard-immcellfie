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
      name: "depth",
      value: 3,
      bind: {
        name: "Depth: ",
        input: "range",
        min: 1,
        max: 3, 
        step: 1
      }
    },
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
  transform: [
    {
      filter: "datum.depth === depth",
    },
    {
      flatten: ["data.subjects", "data.scores1", "data.activities1"],
      as: ["subject", "score", "activity"]
    },
    {
      calculate: "datum[value]",
      as: ["value"]
    }
  ],
  layer: [
    {
      mark: { 
        type: "rect"
      },
      encoding: {
        y: {
          field: "data.name", 
          type: "ordinal",
          sort: {
            op: { signal: "sortBy" },
            field: "value",
            order: "descending"
          },
          title: "task phenotype"
        },
        x: {
          field: "subject", 
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
          },
          legend: {
            title: { signal: "value" }
          }
        },
        tooltip: [ 
          { field: "id", title: "name" },
          { field: "subject", title: "subject" },
          { field: "score" }, 
          { field: "activity" } 
        ]
      } 
    }
/*    ,
    {
      transform: [
        {
          aggregate: [{
            op: "mean",
            field: "value",
            as: "mean_value"
          }],
          groupby: ["data.name"]
        },
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
        type: "rect"
      },
      encoding: {
        y: { 
          field: "data.name",
          type: "ordinal",
          sort: {
            field: "mean_value",
            order: "descending"
          },
        },
        fill: { value: "none" },
        stroke: { 
          condition: {
            selection: "highlight",
            value: { signal: "colorScheme === 'lightgreyred' ? '#2171b5' : '#a50f15'" }
          }
        }
      } 
    }
*/    
  ]
};