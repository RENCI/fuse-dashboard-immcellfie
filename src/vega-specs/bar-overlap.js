export const barOverlap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 30,
  padding: 5,
  autosize: {
    resize: true,
    contains: "padding"
  },
  params: [{
    name: "ticks",
    value: []
  }],
  data: {
    name: "data"
  },
  layer: [
    {
      transform: [{
        filter: "datum.type === 'all'"
      }],
      mark: {
        type: "bar",
        cornerRadius: 3,
        opacity: 0.25
      },
      encoding: {
        x: {
          field: "start",
          type: "quantitative",
          scale: { nice: false, padding: 0 },
          axis: {  
            values: { expr: "ticks"},
            title: null,
            domain: false
          }
        },
        x2: {
          field: "end",
          type: "quantitative"
        },
        y: { value: 7 },
        y2: { value: { expr: "height - 7" } },
        color: { 
          field: "subgroup",
          type: "ordinal",
          scale: { range: ["url(#diagonalHatch1)", "url(#diagonalHatch2)"] },
          legend: null
        },
        order: { field: "order" }
      }
    },
    {
      transform: [{
        filter: "datum.type === 'included'"
      }],
      mark: {
        type: "bar",
        fill: "none",
        cornerRadius: 3,
        strokeWidth: 2
      },
      encoding: {
        x: {
          field: "start",
          type: "quantitative"
        },
        x2: {
          field: "end",
          type: "quantitative"
        },
        y: { value: { expr: "datum.subgroup === 1 ? 0 : 4" } },
        y2: { value: { expr: "datum.subgroup === 1 ? height : height - 4" } },
        //y: { value: { expr: "datum.subgroup === 1 ? height / 2 : height / 2 + 2" } },
        //y2: { value: { expr: "datum.subgroup === 1 ? height / 2 : height / 2 + 2" } },
        stroke: { 
          field: "subgroup",
          legend: null
        },
        order: { field: "order" }
      }
    }
  ]
  
};