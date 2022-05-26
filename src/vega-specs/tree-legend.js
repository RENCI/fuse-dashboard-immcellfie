const treeLegend = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: 200,
  autosize: {
    type: "fit",
    resize: true
  },
  signals: [
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    {
      name: "scoreDomain",
      value: [0, 1]
    }
  ],
  data: {
    name: "data",
  },
  scales: [
    {
      name: "score",
      type: "linear",
      domain: { signal: "scoreDomain" },
      range: { scheme: { signal: "colorScheme" } }
    },
    {
      name: "activity",
      type: "linear",
      domain: [0, 1],
      range: { scheme: { signal: "colorScheme" } }
    },
    {
      name: "specialValues",
      type: "ordinal",
      domain: ["inconclusive"],
      range: ["#c6dbef"]
    },
  ],
  legends: [
    {
      fill: "score",
      title: "score",
      direction: "horizontal"
    },
    {
      fill: "activity",
      title: "activity",
      direction: "horizontal"
    },
    { 
      fill: "specialValues",
      symbolStrokeColor: "#ddd"
    }
  ]
};

const treeComparisonLegend = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: 200,
  autosize: {
    type: "fit",
    resize: true
  },
  data: {
    name: "data",
  },
  signals: [
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    {
      name: "scoreDomain",
      value: [0.1, 10]
    }
  ],
  scales: [
    {
      name: "score",
      type: "log",
      base: 2,
      domain: { signal: "scoreDomain" },
      range: { scheme: { signal: "colorScheme" } }
    },
    {
      name: "activity",
      type: "linear",
      domain: [0, 1],
      range: { scheme: { signal: "colorScheme" } }
    },
    {
      name: "specialValues",
      type: "ordinal",
      domain: ["inconclusive"],
      range: ["#c6dbef"]
    },
    {
      name: "stroke",
      type: "log",
      base: 10,
      domain: [0.01, 1],
      range: { scheme: "greys" },
      reverse: true
    }
  ],
  legends: [
    {
      fill: "score",
      title: "score",
      direction: "horizontal"
    },
    {
      fill: "activity",
      title: "activity",
      direction: "horizontal"
    },
    { 
      fill: "specialValues",
      symbolStrokeColor: "#ddd"
    },
    {
      fill: "stroke",
      title: "p-value",
      values: [0.01, 0.05, 0.1, 1],
      direction: "horizontal"
    }
  ]
};

export { treeLegend, treeComparisonLegend };