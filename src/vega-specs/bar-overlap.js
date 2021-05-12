export const barOverlap = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
<<<<<<< HEAD
  height: 30,
=======
  height: 35,
>>>>>>> feature/data-grouping
  padding: 0,
  autosize: {
    resize: true,
    contains: "padding"
  },
<<<<<<< HEAD
=======
  view: {
    stroke: "none"
  },
>>>>>>> feature/data-grouping
  params: [
    {
      name: "colors",
      value: ["red", "blue", "green"]
    }
  ],
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
<<<<<<< HEAD
=======
        y: { value: { expr: "datum.yOffset" } },
        y2: { value: { expr: "height - datum.yOffset" } },
>>>>>>> feature/data-grouping
        color: { 
          field: "section",
          scale: { 
            range: [ 
              { expr: 'colors[0]' },
              { expr: 'colors[1]' },
              { expr: 'colors[2]' }
            ] 
          },
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