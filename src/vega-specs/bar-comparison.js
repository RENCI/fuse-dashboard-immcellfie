export const barComparison = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: { step: 32 },
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
    column: {
      field: "subgroup",
      title: null
    },
    x: {
      field: "value",
      type: "ordinal"
    },
    y: {
      aggregate: "count",
      field: "value",
      title: null
    },
    color: {
      field: "subgroup",
      type: "nominal"
    }
  },
  resolve: { 
    axis: { y: "independent" },
    scale: { y: "independent" }
  }
};