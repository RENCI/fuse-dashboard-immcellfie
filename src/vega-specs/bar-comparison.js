export const barComparison = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: { step: 24 },
  height: 100,
  autosize: {
    resize: true
  },
  params: [
    {
      name: "valueName",
      value: "value"
    },
    {
      name: "scheme",
      value: "category10"
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
      groupby: ["subgroupName"]
    },
    {
      calculate: "1 / datum.total",
      as: "fraction"
    }
  ],
  mark: "bar",
  encoding: {
    column: {
      field: "value",
      header: {
        title: { expr: "valueName" },
        titleOrient: "bottom",
        labelOrient: "bottom",
        labelExpr: "datum.value === 0 ? 'inactive' : 'active'",
        labelPadding: 110
      }
    },
    x: {
      field: "subgroupName",
      type: "ordinal",
      axis: null
    },
    y: {
      aggregate: "sum",
      field: "fraction",
      scale: { domain: [0, 1] },
      title: "count"
    },
    color: {
      field: "subgroupName",
      type: "nominal",
      scale: { scheme: { signal: "scheme" }},
      legend: { title: "subgroup" }
    }
  }
};