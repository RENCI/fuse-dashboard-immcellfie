export const iciclePlot = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: { signal: "containerWidth" },
  height: { signal: "containerWidth * 4" },
  title: { text: "Metabolic task icicle plot" },
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
      value: 1,
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
    },      
    {
      name: "labelOpacity",
      value: "0.75",
      bind: {
        name: "Label opacity: ",
        input: "range",
        min: 0,
        max: 1, 
        step: 0.05
      }
    },
    {
      name: "colorScheme",
      value: "lightgreyred",
      bind: {
        name: "Color scheme: ",
        input: "select",
        options: ["lightgreyred", "yellowgreenblue"]
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
          type: "partition",
          method: "squarify",
          ratio: 1,
          padding: 5,
          round: true,
          as: ["y0", "x0", "y1", "x1", "depth", "children"],
          size: [
            { signal: "height" }, 
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
      domain: { 
        data: "data", 
        field: "value" 
      },
      range: { scheme: { signal: "colorScheme" } }
    },
    {
      name: "stroke",
      type: "ordinal",
      domain: [1, 2, 3, 4],
      range: ["#000", "#666", "#bbb", null]
    },
    {
      name: "strokeWidth",
      type: "ordinal",
      domain: [1, 2, 3, 4],
      range: [3, 2, 1, 0]
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
      from: { data: "data" }, 
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
          strokeWidth: {
            scale: "strokeWidth",
            field: "depth"
          },
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { signal: "width" },
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
          strokeWidth: { value: 4 }
        },
        update: {
          stroke: { value: "none" },
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" },
          zindex: { field: "depth" },
          tooltip: { signal: "datum.tooltip" }
        },
        hover: {
          stroke: { signal: "colorScheme === 'lightgreyred' ? '#2171b5' : '#a50f15'" }
        }
      }
    },
    {
      type: "text",
      from: { data: "top" },
      interactive: false,
      encode: {
        enter: {
          text: { field: "label" },
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: { value: "#000" },
          fontSize: { value: 18 },
          fontWeight: { value: "bold" },
          blend: { value: "difference" }
        },
        update: {
          x: { signal: "0.5 * (datum.x0 + datum.x1)" },
          y: { signal: "0.5 * (datum.y0 + datum.y1)" },
          opacity: { signal: "labelOpacity" }
        }
      }
    }
  ]
};