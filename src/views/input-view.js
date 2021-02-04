import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { expressionHeatmap } from "../vega-specs";

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  // Transform to work with vega-lite heatmap
  const heatmapData = !input ? [] : input.data.reduce((p, c) => {
    return p.concat(c.values.map((d, i) => {
      return {
        gene: c.gene,
        patient: i,
        value: d
      };
    }));
  }, []);

  return (
    <>
      { input ? 
        <>
          <h4>Input data</h4>
          <VegaWrapper 
            spec={ expressionHeatmap } 
            data={ heatmapData } 
          />
        </>
      : <h4>No input</h4>
      }
    </>
  ); 
};