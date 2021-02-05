export const treemap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: { signal: "containerWidth" },
  height: { signal: "containerWidth" },
  title: { text: "Metabolic task treemap" },
  autosize: {
    type: "fit",
    resize: true
  },
  signals: [        
    {
      name: "containerWidth",
      value: 1032,
      on: [
        {
          events: [
            {
              source: "window",
              type: "resize"
            },
            {
              source: "window",
              type: "load"
            }
          ],
          update: "containerSize()[0]"
        }
      ]
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
    },      
    {
      name: "value",
      value: "score",
      bind: {
        name: "Value: ",
        input: "select",
        options: ["score", "activity"]
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
          type: "treemap",
          method: "squarify",
          ratio: 1,
          paddingInner: 0,
          paddingOuter: 8,
          round: true,
          size: [
            { signal: "width" }, 
            { signal: "width" }
          ]
        },
        {
          type: "filter",
          expr: "datum.depth > 0 && datum.depth <= depth",
        },
        {
          type: "formula",
          expr: "datum[value]",
          as: "value"
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
        expr: "datum.depth < 4",
      }]
    },
    { 
      name: "leaves",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth === 4"
      }]
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
      range: ["#000", "#666", "#bbb", null]
    }
  ],
  legends: [
    {
      fill: "color",
      title: "value"
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "nodes" },        
      interactive: false,    
      encode: {
        update: {
          fill: {
            scale: "color",
            field: "value"
          },
          stroke: { 
            scale: "stroke",
            field: "depth"
          },
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" },
          zindex: { field: "depth" }
        }
      }
    },
    {
      type: "rect",
      from: { data: "nodes" },
      encode: {
        enter: {
          fill: { value: "#000" },
          fillOpacity: { value: 0 },
          strokeWidth: { value: 3 }
        },
        update: {
          stroke: { value: "none" },
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" },
          zindex: { field: "depth" },
          tooltip: { signal: "datum.name" }
        },
        hover: {
          stroke: { value: "#a50f15" }
        }
      }
    },
    {
      type: "rect",
      from: { data: "leaves" },        
      interactive: false,    
      encode: {
        update: {
          fill: {
            scale: "color",
            field: "value"
          },
          stroke: { 
            scale: "stroke",
            field: "depth"
          },
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