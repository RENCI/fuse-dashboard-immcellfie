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
  data: {
    name: "data"
  },
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
    fill: {
      value: { signal: "datum.value === value ? '#b2182b' : '#4C78A8'" }
    },
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
  },
  config: {
    scale: {
      bandPaddingInner: 0.2
    }
  } 
};