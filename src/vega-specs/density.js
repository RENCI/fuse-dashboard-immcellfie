export const density = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
//  title: "Distribution",
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
      bandwidth: 0.3
    }],
    mark: "area",
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
      }
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
  }]
};