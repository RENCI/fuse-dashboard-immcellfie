export const expressionHeatmap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: { signal: "containerWidth - 80" },
  height: 1,
  padding: "auto",
  title: "Gene expression heat map",
  autosize: {
    type: "pad",
    resize: true,
    contains: "padding"
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
    {
      name: "sortBy",
      value: "median"
    },
    {
      name: "colorScheme",
      value: "lightgreyred"
    },
    {
      name: "ticks",
      value: [0, 1]      
    }
  ],
  data: { 
    name: "data" 
  },
  scales: [
    {
      name: "x",
      type: "band",
      domain: {
        data: "data",
        field: "id"
      },
      range: "width",
      nice: true
    },
    {
      name: "y",
      type: "band",
      domain: {
        data: "data",
        field: "gene",
        sort: {
          op: { signal: "sortBy" },
          field: "value",
          order: "descending"
        }
      },
      range: { "step": 4 }
    },    
    {
      name: "color",
      type: "symlog",
      domain: { data: "data", field: "value" },
      range: { scheme: { signal: "colorScheme" } }
    }
  ],
  axes: [
    {
      scale: "x",
      orient: "top",
      title: "Subjects"
    },
    {
      scale: "y",
      orient: "left",
      title: "Genes",
      values: []
    }
  ],
  legends: [
    {
      type: "gradient",
      fill: "color",
      title: 'Values',
      values: { signal: "ticks"}
    }
  ],
  marks: [
    {
      type: "rect",
      from: { data: "data" },
      encode: {
        update: {
          fill: {
            scale: "color",
            field: "value"
          },
          x: {
            scale: "x",
            field: "id"
          },
          y: {
            scale: "y",
            field: "gene"
          },
          width: {
            scale: "x",
            band: 1.05
          },
          height: {
            scale: "y",
            band: 1
          },
          tooltip: { signal: "{ title: 'Value: ' + datum.value, 'Subject': datum.id, 'Gene': datum.gene }" }
        }
      }
    }
  ]  
};