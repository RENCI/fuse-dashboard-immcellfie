import { createPValueVersion, createLogScaleVersion } from "./hierarchy-utils";

const voronoiTreemap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: "container",
  title: { 
    text: "Metabolic task Voronoi treemap",
    subtitle: { signal: "subtitle" }
  },
  autosize: {
    type: "fit",
    resize: true
  },
  signals: [ 
    {
      name: "subtitle",
      value: ""
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
      name: "strokeField",
      value: "depth"
    },
    {
      name: "legendTitle",
      value: "score"
    },
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    { 
      name: "reverseColors",
      value: false
    },
    {
      name: "highlightColor",
      value: "#2171b5",
    },
    {
      name: "inconclusiveColor",
      value: "#c6dbef",
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
          type: "filter",
          expr: "datum.depth > 0 && datum.depth <= depth",
        },
        {
          type: "formula",
          as: "value",
          expr: "datum.data[value]"
        },
        {
          type: "formula",
          as: "strokeValue",
          expr: "datum.data[strokeField]"
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
      name: "dummy",
      values: [{}]
    }
  ],
  scales: [
    {
      name: "color",
      type: "linear",
      domain: { signal: "domain" },
      range: { scheme: { signal: "colorScheme" } },
      reverse: { signal: "reverseColors" }
    },
    {
      name: "specialValues",
      type: "ordinal",
      domain: ["inconclusive"],
      range: { signal: "[inconclusiveColor]" }
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
      title: { signal: "legendTitle" }
    },
    { 
      fill: "specialValues",
      symbolStrokeColor: "#ddd"
    }
  ],
  marks: [
    {
      type: "rect", 
      from: { data: "dummy" },
      interactive: false,    
      encode: {
        enter: {
          x: { value: 0 },
          y: { value: 0 },
          width: { signal: "width" },
          height: { signal: "height" },
          fill: { value: "none" }             
        }
      }
    },
    {
      type: "group",
      encode: {
        update: {
          x: { signal: "width / 2" },
          y: { signal: "min(width, height) / 2" },
        }
      },
      marks: [    
        {
          type: "path",
          from: { data: "data" }, 
          interactive: false,    
          encode: {
            update: {
              fill: [
                {
                  test: "!isValid(datum.value)",
                  signal: "scale('specialValues', 'inconclusive')"
                },
                {
                  scale: "color",
                  field: "value"
                }            
              ],
              fillOpacity: [
                {
                  test: "datum[value] === 'na'",
                  value: 0,
                },
                {
                  value: 1
                }
              ],
              path: { field: "path" },
              scaleX: { signal: "min(width, height) / 2" }, 
              scaleY: { signal: "min(width, height) / 2" }                        
            }
          }
        },
        {
          type: "path",
          from: { data: "data" }, 
          interactive: false, 
          sort: { 
            field: "datum.strokeValue",
            order: "descending"
          },   
          encode: {
            update: {
              fill: "none",
              stroke: { 
                scale: "stroke",
                field: "strokeValue"
              },
              strokeWidth: {
                scale: "strokeWidth",
                field: "depth"
              },
              path: { field: "path" },
              scaleX: { signal: "min(width, height) / 2" }, 
              scaleY: { signal: "min(width, height) / 2" }
            }
          }
        },
        {
          type: "path",
          from: { data: "nodes" },
          encode: {
            enter: {
              fill: { value: "#000" },
              fillOpacity: { value: 0 },
              strokeWidth: { value: 4 }
            },
            update: {
              stroke: { signal: "datum.data.selected ? highlightColor : 'none'" },
              path: { field: "path" },
              scaleX: { signal: "min(width, height) / 2" }, 
              scaleY: { signal: "min(width, height) / 2" },
              tooltip: { signal: "datum.data" }
            },
            hover: {
              stroke: { signal: "highlightColor" }
            }
          }
        },
        {
          type: "text",
          from: { data: "top" },
          interactive: false,
          encode: {
            enter: {
              text: { field: "data.label" },
              align: { value: "center" },
              baseline: { value: "middle" },
              fill: { value: "#000" },
              fontSize: { value: 18 },
              fontWeight: { value: "bold" },
              blend: { value: "difference" }
            },
            update: {
              x: { signal: "datum.polygon.site.x * min(width, height) / 2" },
              y: { signal: "datum.polygon.site.y * min(width, height) / 2" },
              opacity: { signal: "labelOpacity" }
            }
          }      
        } 
      ]
    }
  ]
};

// Create a copy to add p value for outline because you can't set the scale type using a signal/expression...
const voronoiTreemapPValue = createPValueVersion(voronoiTreemap);

// Create a copy for version with fill log scale because you can't set the scale type using a signal/expression...
const voronoiTreemapLogScale = createLogScaleVersion(voronoiTreemapPValue);

export { voronoiTreemap, voronoiTreemapPValue, voronoiTreemapLogScale };