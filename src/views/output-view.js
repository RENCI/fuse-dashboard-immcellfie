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
    return p.concat(c.scores.map((d, i) => {
      return {
        gene: c.gene,
        id: i,
        score: d,
        value: c.values[i]
      };
    }));
  }, []);

  // Create hierarchy
  // XXX: Consider stratifying here to make it easier to aggregate scores/values
  const hierarchyData = !output ? [] : Object.values(output.data.reduce((p, c) => {
    const parent = {
      0: 2,
      1: null,
      2: 1
    };

    c.phenotype.forEach((d, i, a) => { 
      p[d] = {
        name: d,
        parent: parent[i] === null ? "root" : a[parent[i]],
      };
    });

    p[c.phenotype[0]].score = c.scores.reduce((p, c) => {
      return p + c;
    }, 0) / c.scores.length;

    p[c.phenotype[0]].value = c.values.reduce((p, c) => {
      return p + c;
    }, 0) / c.values.length;

    c.scores.forEach((d, i) => {
      const id = c.phenotype[0] + "_" + i;

      p[id] = {
        name: id,
        parent: c.phenotype[0],
        score: d,
        value: c.values[i]
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