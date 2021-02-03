import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { heatmap } from "../vega-specs";

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  // Transform to work with vega-lite heatmap
  const heatmapData = !input ? [] : input.data.reduce((p, c) => {
    return p.concat(c.values.map((d, i) => {
      return {
        gene: c.gene,
        id: i,
        value: d
      };
    }));
  }, []);

  return (
    <>
      { input ? 
        <>
          <h4>Input gene expression data</h4>
          <VegaWrapper spec={ heatmap } data={ heatmapData } height={ input.data.length * 10 + "px" } />
        </>
      : <h4>No input</h4>
      }
    </>
  ); 
};