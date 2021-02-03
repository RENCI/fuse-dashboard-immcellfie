import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { heatmap } from "../vega-specs";

export const OutputView = () => {
  const [data] = useContext(DataContext);

  const { output } = data;

  // Transform to work with vega-lite heatmap
  const heatmapData = !output ? [] : output.data.reduce((p, c) => {
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
      { output ? 
        <>
          <VegaWrapper spec={ heatmap } data={ heatmapData } height={ output.data.length * 10 + "px" } />
        </>
      : <h4>No output</h4>
      }
    </>
  );  
};