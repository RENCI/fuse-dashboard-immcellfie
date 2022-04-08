export const propertiesBarChart = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: { step: 20 },
  height: 100,
  autosize: {
    resize: true
  },
  params: [
    {
      name: "interactive",
      value: true
    },
    {
      name: "numeric",
      value: false
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
          type: "single",
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
          field: "value",     
          type: "ordinal",
          axis: { 
            labelAngle: { expr: "numeric ? 0 : 30" }, 
            labelAlign: { expr: "numeric ? 'center' : 'left'" },
            title: null,
            labelLimit: 50
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
        strokeWidth: 2,
        cursor: { signal: "interactive ? 'pointer' : 'default'" }
      },
      encoding: {
        x: {
          field: "value",     
          type: "ordinal",
        },
        y: {
          field: "count",
          type: "quantitative"
        },
        stroke: {
          value: { signal: "datum.selected ? '#b2182b' : 'none'" }
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