export const histogram = {
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
    }
  ],
  data: {
    name: "data"
  },
  layer: [
    {
      mark: "bar",
      encoding: {
        x: {
          field: "value",
          bin: true,        
          axis: {
            title: { expr: "valueName" }
          }
        },
        y: {
          aggregate: "count",
          axis: {
            title: null
          }  
        }
      }
    },
    {
      transform:[{
        density: "value",
        counts: true
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
        stroke: { value: "#aaa" }
      }
    },
    {
      mark: "rule",
      encoding: {
        x: {
          aggregate: "mean", 
          field: "value"
        },
        color: {
          value: "#b30000"
        },
        size: {
          value: 3
        }
      }
    }
  ]
};