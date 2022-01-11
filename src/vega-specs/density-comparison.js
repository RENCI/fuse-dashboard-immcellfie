export const densityComparison = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 100,
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "valueName",
      value: "value"
    },
    {
      name: "scheme",
      value: "category10"
    }
  ],
  data: {
    name: "data"
  },
  layer: [ 
/*    
    {
      transform:[{
        density: "value",
        groupby: ["subgroup"],
        cumulative: true
      }],
      mark: "line",
      encoding: {
        x: {
          field: "value",
          type: "quantitative"
        },
        y: {
          field: "density",
          type: "quantitative"
        },
        color: {
          field: "subgroup",
          type: "nominal"
        },
        strokeOpacity: { value: 0.25 }, 
        strokeDash: { value: [5, 5] }
      }
    },    
*/    
    {
      transform:[{
        density: "value",
        groupby: ["subgroupName"],
        counts: false
      }],
      mark: { 
        type: "area", 
        line: true,
        interpolate: "linear" 
      },
      encoding: {
        x: {
          field: "value",
          type: "quantitative",       
          axis: {
            title: { expr: "valueName" }
          }
        },
        y: {
          field: "density",
          type: "quantitative",   
          axis: {
            title: null
          }  
        },
        color: {
          field: "subgroupName",
          type: "nominal",
          scale: { scheme: { signal: "scheme" }},
          legend: { title: "subgroup" }
        },
        fillOpacity: { value: 0.5 }
      }
    }
  ]
};