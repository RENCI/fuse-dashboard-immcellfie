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
    },
    {
      name: "ticks",
      value: [0, 1]      
    }
  ],
  data: [
    {
      name: "data",
      transform: [{
        type: "formula",
        as: "group",
        expr: "datum.group ? datum.group : { number: 0, name: '' }" 
      }]
    },
    { 
      name: "groups",
      source: "data",
      transform: [
        {
          type: "project",
          fields: ["group.name"],
          as: ["name"]
        },        
        {
          type: "aggregate",
          groupby: ["name"]
        }
      ]
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
      range: { "step": 4 }
    },    
    {
      name: "color0",
      type: "symlog",
      domain: { data: "data", field: "value" },
      range: { scheme: "browns" }
    },
    {
      name: "color1",
      type: "symlog",
      domain: { data: "data", field: "value" },
      range: { scheme: "teals" }
    }
  ],
  axes: [
    {
      scale: "x",
      orient: "top",
      title: "Subjects"
    }
  ],
  legends: [
    {
      type: "gradient",
      fill: "color0",
      title: { signal: "data('groups').length > 1 ? 'Group ' + data('groups')[0].name : 'Values'" },
      values: { signal: "ticks"}
    },
    {
      type: "gradient",
      fill: "color1",
      title: { signal: "data('groups').length > 1 ? 'Group ' + data('groups')[1].name : ''" },
      values: { signal: "data('groups').length > 1 ? ticks : []" },
      encode: {
        gradient: { 
          update: {
            opacity: { signal: "data('groups').length > 1 ? 1 : 0" }
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
            scale: { signal: "'color' + datum.group.number" },
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
          tooltip: { signal: "{ title: 'Value: ' + datum.value, 'Subject': datum.id, 'Group': datum.group.name, 'Gene': datum.gene }" }
        }
      }
    }
  ]
/*
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: 200,
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
    },
    {
      name: "ticks",
      value: [0, 1]      
    }
  ],
  data: {
    name: "data"
  },
  facet: { 
    column: { field: "group" } 
  },
  spec: {
    height: { step: 4 },
    mark: { 
      type: "rect",
      tooltip: true
    },
    encoding: {
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
  },
  resolve: { 
    scale: { 
      x: "independent",
      y: "shared"
    } 
  }
*/  
};