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
      value: "median",
      bind: {
        input: "select",
        options: ["median", "mean", "max"]
      }
    },
    {
      name: "colorScheme",
      value: "lightgreyred",
      bind: {
        name: "Color scheme: ",
        input: "select",
        options: ["lightgreyred", "yellowgreenblue"]
      }
    }
  ],
  data: [
    {
      name: "data"
    }
  ],

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
      range: { "step" : 4 }
    },
    {
      name: "colorA",
      type: "symlog", 
      domain: { data: "data", field: "value" },
      range: { scheme: "browns" }
    },
    {
      name: "colorB",
      type: "symlog", 
      domain: { data: "data", field: "value" },
      range: { scheme: "teals" }
    }
  ],
  legends: [
    {
      fill: "colorA",
      title: "Group A"
    },
    {
      fill: "colorB",
      title: "Group B"
    },
  ],  
  marks: [
    {
      type: "rect",
      from: { data: "data" }, 
      encode: {
        update: {
          fill: { 
            scale: { signal: "'color' + datum.group" },
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
            band: 1
          },
          height: {
            scale: "y",
            band: 1
          }
        }
      }
    }
  ]
/*  
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: { step: 2 },
  title: "Gene expression heat map",
  autosize: {
    resize: true
  },
  params: [
    {
      name: "sortBy",
      value: "median",
      bind: {
        input: "select",
        options: ["median", "mean", "max"]
      }
    },
    {
      name: "colorScheme",
      value: "lightgreyred",
      bind: {
        name: "Color scheme: ",
        input: "select",
        options: ["lightgreyred", "yellowgreenblue"]
      }
    }
  ],
  data: {
    name: "data"
  },
  transform:[
    { "filter": "datum.group === 'A'" }
  ],
  mark: { 
    type: "rect",
    tooltip: true
  },
  encoding: {
    column: { field: "group" },
    y: {
      field: "gene", 
      type: "ordinal",
      axis: null,
      sort: {
        op: { signal: "sortBy" },
        field: "value",
        order: "descending"
      }
    },
    x: {
      field: "id", 
      title: "subject",
      type: "ordinal",
      axis: {
        orient: "top"
      },
      scale: {
        round: true
      }
    },  
    color: { 
      field: "value",
      type: "quantitative",
      scale: {
        scheme: { signal: "colorScheme" },
        type: "symlog"
      }
    }
  }
*/  
};