export const phenotypeBarChart = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: 100,
  height: 100,
  autosize: {
    resize: true
  },
  params: [
    {
      name: "value",
      value: "none"
    },
    {
      name: "interactive",
      value: true
    }
  ],
  data: {
    name: "data"
  },
  layer: [
    {
      selection: {
        highlight: {
          type: "single", 
          on: "mouseover",
          empty: "none", 
          clear: "mouseout"
        },
        select: {
          type: "multi",
          on: "click",
          empty: "none"
        }
      },
      transform: [{
        filter: "datum.subgroup === 'all'"
      }],
      mark: {
        type: "bar",
        strokeWidth: 1,
        cursor: { signal: "interactive ? 'pointer' : 'default'" }
      },
      encoding: {
        x: {
          field: "shortLabel",     
          type: "nominal",
          axis: { 
            labelAngle: 30, 
            title: null
          }
        },
        y: {
          field: "count",
          type: "quantitative",
          axis: { title: null }
        },
        fillOpacity: { value: 0.25 },
        stroke: {
          condition: {
            selection: "highlight",
            value: "#333"
          },
          value: "none"
        },
        tooltip: [
          { field: "value" },
          { field: "count" }
        ]
      }
    },
    {
      transform: [{
        filter: "datum.subgroup !== 'all'"
      }],
      mark: {
        type: "bar",
        strokeWidth: 3,
        cursor: { signal: "interactive ? 'pointer' : 'default'" }
      },
      encoding: {
        x: {
          field: "shortLabel",     
          type: "nominal",
          axis: { 
            labelAngle: 30, 
            title: null
          }
        },
        y: {
          field: "count",
          type: "quantitative",
          axis: { title: null }
        },
        stroke: {
          value: { signal: "datum.value === value ? '#b2182b' : 'none'" }
        },
        tooltip: [
          { field: "value" },
          { field: "count" }
        ]
      },
    }
  ],
  config: {
    scale: {
      bandPaddingOuter: 0.2,
      bandPaddingInner: 0.2
    }
  } 
};