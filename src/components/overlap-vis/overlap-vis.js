import { useContext } from "react";
import { ColorContext } from "contexts";
import { VegaWrapper } from "components/vega-wrapper";
import { ResizeWrapper } from "components/resize-wrapper";
import { barOverlap } from "vega-specs";

export const OverlapVis = ({ subgroup1, subgroup2, overlap, overlapMethod }) => {
  const [{ subgroupColors }] = useContext(ColorContext);

  const [color1, color2] = subgroupColors;

  const n1 = subgroup1.samples.length;
  const n2 = subgroup2.samples.length;

  const x1 = 0;
  const x2 = n1 - overlap;
  const x3 = n1;
  const x4 = x2 + n2;

  const incEnd1 = overlapMethod === "both" || overlapMethod === "subgroup1" ? x3 : x2;
  const incStart2 = overlapMethod === "both" || overlapMethod === "subgroup2" ? x2 : x3;

  const offsetAmount = 6;
  const offset1 = overlap && overlapMethod === "both" ? 2 : offsetAmount;

  const data = [
    { type: "all", section: 1, start: x1, end: x2, yOffset: offsetAmount },
    { type: "all", section: 2, start: x3, end: x4, yOffset: offsetAmount },
    { type: "all", section: 3, start: x2, end: x3, yOffset: offsetAmount },
    { type: "included", section: 1, start: x1, end: incEnd1, yOffset: offset1 },
    { type: "included", section: 2, start: incStart2, end: x4, yOffset: offsetAmount },
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

  const patternName = "overlapDiagonalHatch";
 
  return (
    <>    
      <svg height="0" width="0" xmlns="http://www.w3.org/2000/svg" version="1.1"> 
        <defs> 
          <pattern id={ patternName } width={ 10 } height= { 10 } patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1={ 2.5 } y1={ 0 } x2={ 2.5 } y2={ 20 } style={{ stroke: color1, strokeWidth: 5 }} />
            <line x1={ 7.5 } y1={ 0 } x2={ 7.5 } y2={ 20 } style={{ stroke: color2, strokeWidth: 5 }} />
          </pattern>
        </defs> 
      </svg>
      <ResizeWrapper>
        <VegaWrapper
          options={{
            actions: false,
            renderer: "svg"
          }}
          spec={ barOverlap }
          data={ data }
          signals={[
            { name: "colors", value: [color1, color2, "url(#" + patternName + ")"] }
          ]}
          spinner={ false }              
        />
      </ResizeWrapper>
    </>
  );
};