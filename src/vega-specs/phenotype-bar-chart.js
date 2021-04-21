export const phenotypeBarChart = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: { expr: "title" },
  width: 100,
  height: 100,
  autosize: {
    resize: true
  },
  params: [
    {
      name: "title",
      value: "Hello"
    }
  ],
  data: {
    name: "data"
  },
  mark: "bar",
  encoding: {
    x: {
      field: "shortLabel",     
      type: "nominal",
      axis: { labelAngle: 30, title: null }
    },
    y: {
      field: "count",
      type: "quantitative"
    },
    tooltip: [
      { field: "value" },
      { field: "count" }
    ]
  }
};