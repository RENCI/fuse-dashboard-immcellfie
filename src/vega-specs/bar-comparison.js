export const barComparison = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: { step: 30 },
  height: 100,
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "valueName",
      value: "value"
    }
  ],
  data: {
    name: "data"
  },
  transform: [
    {
      joinaggregate: [{
        op: "count",
        as: "total"
      }],
      groupby: ["subgroup"]
    },
    {
      calculate: "1 / datum.total",
      as: "fraction"
    }
  ],
  mark: "bar",
  encoding: {
    column: {
      field: "value"
    },
    x: {
      field: "subgroup",
      type: "ordinal",
      axis: null
    },
    y: {
      aggregate: "sum",
      field: "fraction",
      title: null,
      scale: { domain: [0, 1] }
    },
    color: {
      field: "subgroup",
      type: "nominal"
    }
  }
};

/*
export const barComparison = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: 100,
  autosize: {
    type: "fit",
    resize: true
  },
  params: [
    {
      name: "valueName",
      value: "value"
    }
  ],
  data: {
    name: "data"
  },
  mark: "bar",
  encoding: {
    x: {
      field: "subgroup",
      type: "ordinal",
      axis: { 
        title: null,
        labelAngle: 20 
      }
    },
    y: {
      aggregate: "count",
      field: "value",
      stack: "normalize",
      title: null,

    },
    color: {
      field: "value",
      type: "nominal"
    }
  }
};
*/