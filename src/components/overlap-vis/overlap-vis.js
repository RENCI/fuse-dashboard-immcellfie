import React from "react";
import { VegaWrapper } from "../vega-wrapper";
import { barOverlap } from "../../vega-specs";

export const OverlapVis = ({ subgroup1, subgroup2, overlap, overlapMethod }) => {
  const n1 = subgroup1.subjects.length;
  const n2 = subgroup2.subjects.length;

  const x1 = 0;
  const x2 = n1 - overlap;
  const x3 = n1;
  const x4 = x2 + n2;

  const incEnd1 = overlapMethod === "both" || overlapMethod === "subgroup1" ? x3 : x2;
  const incStart2 = overlapMethod === "both" || overlapMethod === "subgroup2" ? x2 : x3;

  const data = [
    { type: "all", section: 1, start: x1, end: x2 },
    { type: "all", section: 2, start: x3, end: x4 },
    { type: "all", section: 3, start: x2, end: x3 },
    { type: "included", section: 1, start: x1, end: incEnd1 },
    { type: "included", section: 2, start: incStart2, end: x4 }
  ];

  if (x2 - x1 > 0 || overlapMethod === "neither" || overlapMethod === "subgroup2") {
    data.push({ type: "label", position: x1 + (x2 - x1) / 2, value: n1 - overlap });
  }

  if (overlap > 0) {
    data.push({ type: "label", position: x2 + (x3 - x2) / 2, value: overlap });
  }

  if (x4 - x3 > 0 || overlapMethod === "neither" || overlapMethod === "subgroup1") {
    data.push({ type: "label", position: x3 + (x4 - x3) / 2, value: n2 - overlap });
  }

  return (
    <VegaWrapper
      options={{
        actions: false,
        renderer: "svg"
      }}
      spec={ barOverlap }
      data={ data }
      spinner={ false }              
    />
  );
};