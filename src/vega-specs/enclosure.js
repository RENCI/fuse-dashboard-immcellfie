export const enclosure = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: { signal: "containerWidth" },
  height: { signal: "containerWidth" },
  title: { text: "Metabolic task enclosure diagram" },
  autosize: {
    type: "fit",
    resize: true
  },
  signals: [        
    {
      name: "containerWidth",
      value: 1032,
      on: [
        {
          events: [
            {
              source: "window",
              type: "resize"
            },
            {
              source: "window",
              type: "load"
            }
          ],
          update: "containerSize()[0]"
        }
      ]
    },
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
          padding: 0,
          size: [{signal: "width"}, {signal: "height"}]
        }
      ]
    }
  ],

  scales: [
    {
      name: "color",
      type: "ordinal",
      range: {scheme: "category20"}
    }
  ],

  marks: [
    {
      type: "symbol",
      from: {data: "data"},
      encode: {
        enter: {
          fill: {scale: "color", field: "id"},
          stroke: {value: "white"}
        },
        update: {
          x: {field: "x"},
          y: {field: "y"},
          size: {signal: "4 * datum.r * datum.r"},
          zindex: { field: "depth" }
        }
      }
    }
  ]
}