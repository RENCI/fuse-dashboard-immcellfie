import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  width: "container",
  height: "container",
  autosize: {
    resize: true
  },
  data: {
    name: "data"
  },
  mark: { 
    type: "rect",
    tooltip: true
  },
  encoding: {
    y: {
      field: "id", 
      type: "ordinal",
      sort: {
        op: "median",
        field: "value",
        order: "descending"
      }
    },
    x: {
      field: "gene", 
      type: "ordinal"
    },
    color: { 
      field: "value",
      type: "quantitative",
      scale: {
        type: "symlog"
      }
    }
  }
};

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  // Transform input to work with heatmap
  const heatmapData = !input ? [] : input.data.reduce((p, c) => {
    return p.concat(c.values.map((d, i) => {
      return {
        id: c.id,
        gene: i,
        value: d
      };
    }));
  }, []);

  return (
    <>
      { input ? 
        <>
          <VegaWrapper spec={ spec } data={ heatmapData } height={ input.data.length * 10 + "px" } />
        </>
      : <h4>No input</h4>
      }
    </>
  ); 
};