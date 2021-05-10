import React from "react";
import { VegaWrapper } from "../vega-wrapper";
import { barOverlap } from "../../vega-specs";

export const OverlapVis = ({ subgroup1, subgroup2, overlap, overlapMethod }) => {
  const n1 = subgroup1.subjects.length;
  const n2 = subgroup2.subjects.length;

  const end2 = n1 + n2 - overlap;
  const start2 = end2 - n2;

  const incEnd1 = overlapMethod === "both" || overlapMethod === "subgroup1" ? n1 : n1 - overlap;
  const incStart2 = overlapMethod === "both" || overlapMethod === "subgroup2" ? start2 : start2 + overlap;

  return (
    <VegaWrapper
      options={{
        actions: false,
        renderer: "svg"
      }}
      spec={ barOverlap }
      data={[
        { type: "all", subgroup: 1, start: 0, end: n1 },
        { type: "all", subgroup: 2, start: start2, end: end2 },
        { type: "included", subgroup: 1, start: 0, end: incEnd1 },
        { type: "included", subgroup: 2, start: incStart2, end: end2 }
      ]}
      signals={[
        { name: "ticks", value: [0, start2, n1, end2] }
      ]}
      spinner={ false }              
    />
  );
};