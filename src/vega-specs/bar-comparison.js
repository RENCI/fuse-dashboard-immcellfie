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
      field: "value", 
      type: "ordinal",
      domain: [0, 1],
      spacing: 5,
      axis: { 
        title: "activity",
        orient: "bottom" 
      }
    },
    x: {
      field: "subgroup",
      type: "ordinal",
      axis: null
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
  }
};