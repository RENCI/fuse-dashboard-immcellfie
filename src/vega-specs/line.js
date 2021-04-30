export const line = {
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
  layer: [{
    transform:[{
      density: "value",
      groupby: ["subgroup"],
      bandwidth: 0.3
    }],
    mark: "line",
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
        field: "subgroup",
        type: "nominal"
      }
    }
  }]
};