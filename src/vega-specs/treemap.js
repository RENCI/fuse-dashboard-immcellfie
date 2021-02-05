export const treemap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 960,
  height: 960,
  title: { text: "Metabolic task treemap" },
  autosize: {
    type: "pad",
    resize: true
  },
  signals: [
    {
      name: "width",
      value: 960,
      on: [
        {
          events: {
            source: "window",
            type: "resize"
          },
          update: "containerSize()[0]"
        }
      ]
    },
    {
      name: "value",
      value: "score",
      bind: {
        name: "Value: ",
        input: "select",
        options: ["score", "activity"]
      }
    },
    {
      name: "depth",
      value: 4,
      bind: {
        name: "Depth: ",
        input: "range",
        min: 1,
        max: 4, 
        step: 1
      }
    }
  ],
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
          type: "filter",
          expr: "datum.depth > 0 && datum.depth <= depth",          
        },
        {
          type: "formula",
          expr: "datum[value]",
          as: "value"
        },
        {
          type: "treemap",
          method: "squarify",
          ratio: 1,
          paddingInner: 0,
          paddingOuter: 5,
          round: true,
          size: [
            { signal: "width" }, 
            { signal: "width" }
          ]
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
      name: "nodes",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth < depth"
      }]
    },
    {
      name: "leaves",
      source: "data",
      transform: [
        {
          type: "filter",
          expr: "datum.depth === depth"
        }
      ]
    }
  ],
  scales: [
    {
      name: "color",
      type: "linear",
      domain: { data: "data", field: "value" },
      range: { scheme: "yellowgreenblue" }
    },
    {
      name: "stroke",
      type: "ordinal",
      domain: [1, 2, 3, 4],
      range: ["#fff", "#fff", "#fff", null]
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "nodes" },      
      encode: {
        enter: {
          fill: {
            scale: "color",
            field: "value"
          },
          stroke: { 
            scale: "stroke",
            field: "depth"
          },
          tooltip: { signal: "datum.name" }
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
      interactive: false,
      encode: {
        enter: {
          fill: { 
            scale: "color",
            field: "value"
          },
          stroke: { 
            scale: "stroke",
            field: "depth"
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
      type: "text",
      from: { data: "top" },
      interactive: false,
      encode: {
        enter: {
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: { value: "#000" },
          text: { field: "label" },
          fontSize: { value: 18 },
          fillOpacity: { value: 0.5 }
        },
        update: {
          x: { signal: "0.5 * (datum.x0 + datum.x1)" },
          y: { signal: "0.5 * (datum.y0 + datum.y1)" }
        }
      }
    }
  ]
};