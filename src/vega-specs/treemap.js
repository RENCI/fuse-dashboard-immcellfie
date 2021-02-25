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
      value: 1
    },      
    {
      name: "value",
      value: "score"
    },
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    {
      name: "domain",
      value: [0, 1]
    },
    {
      name: "labelOpacity",
      value: 0.75,
      bind: {
        name: "Label opacity: ",
        input: "range",
        min: 0,
        max: 1, 
        step: 0.05
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
          sort: {
            field: ["data.name"],
            order: ["descending"]
          },
          size: [
            { signal: "width" }, 
            { signal: "width" }
          ]
        },
        {
          type: "filter",
          expr: "datum.depth > 0 && datum.depth <= depth",
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
      name: "interior",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth < 4",
      }]
    }
  ],
  scales: [
    {
      name: "color",
      type: "linear",
      domain: { signal: "domain" },
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
      title: { signal: "value" }
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "data" }, 
      interactive: false,
      encode: {
        update: {
          fill: [
            {
              test: "!isValid(datum[value])",
              value: "#c6dbef"
            },
            {
              scale: "color",
              field: { signal: "value" }
            }            
          ],
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
          x2: { field: "x1" },
          y2: { field: "y1" },
          zindex: { field: "depth" }
        }
      }
    },
    {
      type: "rect",
      from: { data: "interior" },
      encode: {
        enter: {
          fill: { value: "#000" },
          fillOpacity: { value: 0 },
          strokeWidth: { value: 4 },
          tooltip: { signal: "datum.tooltip" }
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