import React, { useContext } from "react";
import * as d3 from "d3";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { heatmap, treemap } from "../vega-specs";

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

  // Create hierarchy
  const hierarchyData = !output ? [] : Object.values(output.data.reduce((p, c) => {
    const parent = {
      0: 2,
      1: null,
      2: 1
    };

    c.phenotype.forEach((d, i, a) => { 
      p[d] = {
        name: d,
        parent: parent[i] === null ? "root" : a[parent[i]]
      };
    });

    c.values.forEach((d, i) => {
      const id = c.phenotype[0] + "_" + i;

      p[id] = {
        name: id,
        parent: c.phenotype[0],
        value: d
      };
    });

    return p;
  }, {}));

  hierarchyData.push({
    name: "root",
    parent: null
  });

  return (
    <>
      { output ? 
        <>
          <h4>Cellfie output</h4>
          <VegaWrapper spec={ heatmap } data={ heatmapData } />
          <VegaWrapper spec={ treemap } data={ hierarchyData } />
        </>
      : <h4>No output</h4>
      }
    </>
  );  
};