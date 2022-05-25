const legend = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: "container",
  autosize: {
    type: "fit",
    resize: true
  },
  data: [
    {
      name: "data",
    }
  ],
  scales: [
    {
      name: "color",
      type: "linear",
      domain: [0, 1],
      range: { scheme: "lightgreyred" }
    },
  ],
  legends: [
    {
      fill: "color",
      title: "legendTitle"
    }
  ]
};

export { legend };