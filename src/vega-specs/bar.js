export const bar = {
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
  mark: "bar",
  encoding: {
    x: {
      field: "value",
      type: "ordinal",
      scale: {
        domain: [0, 1]
      },
      axis: {
        title: "activity",
        labelAngle: 0
      }    
    },
    y: {
      aggregate: "count",
      field: "value",
      title: null
    }
  }
};