export const treemap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 960,
  height: 960,
  data: [
    {
      name: "data",
      transform: [
        {
          type: "stratify",
          key: "name",
          parentKey: "parent"
        },
        {
          type: "treemap",
          method: "squarify",
          ratio: 1.6,
          paddingInner: 0,
          paddingOuter: 5,
          round: false,
          size: [
            { signal: "width" }, 
            { signal: "height" }
          ]
        },
        {
          type: "filter",
          expr: "datum.depth > 0"
        }
      ]
    },
    {
      name: "top",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth === 1"
      }]
    },
    {
      name: "middle",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth === 2"
      }]
    },
    {
      name: "leaves",
      source: "data",
      transform: [{
        type: "filter",
        expr: "!datum.children"
      }]
    }
  ],
  scales: [
    {
      name: "color",
      type: "ordinal",
      range: { scheme: "category20" }
    },
    {
      name: "value",
      type: "linear"
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "top" },
      encode: {
        enter: {
          fill: {
            scale: "color",
            field: "name"
          }
        },
        update: {
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" }
        }
      }
    },
    {
      type: "rect",
      from: { data: "middle" },
      encode: {
        enter: {
          fill: { value: "none" },
          stroke: { value: "#666" }
        },
        update: {
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" }
        }
      }
    },
    {
      type: "rect",
      from: { data: "leaves" },
      encode: {
        enter: {
          fill: { 
            scale: "value",
            field: "value"
           },
          stroke: { value: "#fff" }
        },
        update: {
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" }
        }
      }
    }
  ]
};