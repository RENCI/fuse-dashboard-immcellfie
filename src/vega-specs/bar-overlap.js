export const barOverlap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 30,
  padding: 0,
  autosize: {
    resize: true,
    contains: "padding"
  },
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
        opacity: 0.5,
        height: { expr: "height - 8" }
      },
      encoding: {
        x: {
          field: "start",
          type: "quantitative",
          scale: { nice: false, padding: 0 },
          axis: null
        },
        x2: {
          field: "end",
          type: "quantitative"
        },
        color: { 
          field: "section",
          scale: { range: ["#1f77b4", "#ff7f0e", "url(#diagonalHatch)"] },
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
        y: { value: { expr: "datum.yOffset" } },
        y2: { value: { expr: "height - datum.yOffset" } },
        //y: { value: { expr: "datum.section === 1 ? height / 2 : height / 2 + 2" } },
        //y2: { value: { expr: "datum.section === 1 ? height / 2 : height / 2 + 2" } },
        stroke: { 
          field: "section",
          legend: null
        },
        order: { field: "order" }
      }
    },
    {
      transform: [{
        filter: "datum.type === 'label'"
      }],
      mark: {
        type: "text",
        baseline: "middle"
      },
      encoding: {
        x: {
          field: "position",
          type: "quantitative"
        },
        y: { value: { expr: "height / 2" } },
        text: {
          field: "value"
        }
      }
    }
  ]
  
};