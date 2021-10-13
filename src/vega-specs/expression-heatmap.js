export const expressionHeatmap = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: "container",
  height: "auto",
  title: "Expression heat map",
  autosize: {
    type: "pad",
    resize: false,
    contains: "content"
  },
  signals: [
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
    },
    {
      name: "numColumns",
      value: 1
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
      range: { step: { signal: "max(width / (numColumns + 1), 30)" } },
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
      range: { step: 4 }
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
      title: "subjects"
    },
    {
      scale: "y",
      orient: "left",
      title: "genes",
      values: []
    }
  ],
  legends: [
    {
      type: "gradient",
      fill: "color",
      title: "value",
      orient: "top",            
      direction: "horizontal",
      values: { signal: "ticks" },
      encode: {
        labels: {
          update: {
            align: { value: "center" }
          }
        }
      }
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