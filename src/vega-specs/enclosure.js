import { createPValueVersion, createLogScaleVersion } from "./hierarchy-utils";

const enclosure = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: "container",
  title: { 
    text: "Metabolic task enclosure diagram",
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
          type: "stratify",
          key: "name",
          parentKey: "parent"
        },
        {
          type: "pack",
          padding: 1,    
          sort: {
            field: ["data.name"],
            order: ["ascending"]
          },
          size: [
            { signal: "width" }, 
            { signal: "height" }
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
      type: "symbol",
      from: { data: "data" }, 
      interactive: false,      
      encode: {
        update: {
          fill: [
            {
              test: "!isValid(datum[value])",
              signal: "scale('specialValues', 'inconclusive')"
            },
            {
              scale: "color",
              field: { signal: "value" }
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
          stroke: { 
            scale: "stroke",
            field: { signal: "strokeField" },
          },
          strokeWidth: {
            scale: "strokeWidth",
            field: "depth"
          },
          x: { field: "x" },
          y: { field: "y" },
          size: { signal: "4 * datum.r * datum.r" },
          zindex: { signal: "strokeField === depth ? datum.depth : datum.depth - datum[strokeField]" }        
        }
      }
    },
    {
      type: "symbol",
      from: { data: "interior" }, 
      encode: {
        enter: {
          fill: { value: "#000" },
          fillOpacity: { value: 0 },
          strokeWidth: { value: 4 }
        },
        update: {
          stroke: { signal: "datum.selected ? highlightColor : 'none'" },
          x: { field: "x" },
          y: { field: "y" },
          size: { signal: "4 * datum.r * datum.r" },
          zindex: { field: "depth" },
          tooltip: { signal: "datum" }
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
          text: { field: "label" },
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: { value: "#000" },
          fontSize: { value: 18 },
          fontWeight: { value: "bold" },
          blend: { value: "difference" }
        },
        update: {
          x: { signal: "datum.x" },
          y: { signal: "datum.y" },
          opacity: { signal: "labelOpacity" }
        }
      }
    }
  ]
};

// Create a copy to add p value for outline because you can't set the scale type using a signal/expression...
const enclosurePValue = createPValueVersion(enclosure);

// Create a copy for version with fill log scale because you can't set the scale type using a signal/expression...
const enclosureLogScale = createLogScaleVersion(enclosurePValue);

export { enclosure, enclosurePValue, enclosureLogScale };