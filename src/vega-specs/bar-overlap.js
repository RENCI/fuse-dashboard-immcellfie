export const barOverlap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 80,
  autosize: {
    type: "fit",
    resize: true
  },
  data: {
    name: "data"
  },
  mark: "bar",
  encoding: {
    x: {
      field: "count",
      type: "quantitative",
      stack: true,
      axis: null
    },
    color: { 
      field: "name",
      legend: null
    },
    order: { field: "order" }
  }
};