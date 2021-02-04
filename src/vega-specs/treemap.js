export const treemap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 960,
  height: 960,
  autosize: {
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
          paddingOuter: 5,
          round: true,
          size: [
            { signal: "width" }, 
            { signal: "width" }
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
/*    
    {
      name: "middle",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth === 2"
      }]
    },
*/    
    {
      name: "bottom",
      source: "data",
      transform: [{
        type: "filter",
        expr: "datum.depth === 3"
      }]
    },
    {
      name: "leaves",
      source: "data",
      transform: [
        {
          type: "filter",
          expr: "!datum.children"
        }
      ]
    }
  ],
  scales: [
    {
      name: "top",
      type: "ordinal",
      range: { scheme: "tableau10" }
    },
    {
      name: "color",
      type: "linear",
      domain: { data: "leaves", field: "score" },
      range: { scheme: "yellowgreenblue" }
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "top" },      
      encode: {
        enter: {
          fill: {
            scale: "top",
            field: "name"
          },
          opacity: { value: 0.5 },
          tooltip: { signal: "datum.name"}
        },
        update: {
          x: { field: "x0" },
          y: { field: "y0" },
          x2: { field: "x1" },
          y2: { field: "y1" }
        }
      }
    },
    /*
    {
      type: "rect",
      from: { data: "middle" },
      encode: {
        enter: {
          stroke: {
            value: "#666"
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
    */
    {
      type: "rect",
      from: { data: "bottom" },
      encode: {
        enter: {
          fill: { 
            scale: "color",
            field: "score"
          },
          stroke: {
            value: "#fff"
          },
          tooltip: { signal: "datum.name"}
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
            field: "score"
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