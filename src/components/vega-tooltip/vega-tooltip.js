import React, { useMemo, useRef } from "react";
import { Card } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import * as d3 from "d3";
import { histogram, densityComparison, bar, barComparison } from "../../vega-specs";
import "./vega-tooltip.css";

const { Subtitle, Body, Footer } = Card;

// Borrowed from vega-tooltip
const calculatePosition = (event, tooltipBox, itemBox, offsetX, offsetY) => {
  let x = event.clientX + offsetX;
  if (x + tooltipBox.width > window.innerWidth) {
    x = +event.clientX - offsetX - tooltipBox.width;
  }

  let y = event.clientY + offsetY;
  if (y + tooltipBox.height > window.innerHeight) {
    y = +event.clientY - offsetY - tooltipBox.height;
  }

  return { x, y };
/*  
  let x = itemBox.x + (itemBox.width - tooltipBox.width) / 2 + offsetX;

  if (x + tooltipBox.width > window.innerWidth) {
    x = +event.clientX - offsetX - tooltipBox.width;
  }
  else if (x < 0) {
    x = 0;
  }

  let y = itemBox.y - tooltipBox.height - offsetY;

  if (y + tooltipBox.height > window.innerHeight) {
    y = +event.clientY - offsetY - tooltipBox.height;
  }

  return { x, y };
*/  
};

const formatNumber = d => isNaN(d) ? "Inconclusive" : d3.format(".2f")(d);
const formatPValue = d => d < 0.001 ? "0.001" : d3.format(".3f")(d);

const subgroupValues = (value, key) => {  
  return value ? value[key].filter(({ value }) => !isNaN(value)) : [];
};

const compareValues = (value, key) => {
  return value ? value[key + "1"].concat(value[key + "2"]).filter(({ value }) => !isNaN(value)) : [];
};

export const VegaTooltip = ({ handler, event, item, value, subgroup, subgroupName }) => {
  const div = useRef();

  const { x, y } = event && div.current ?
    calculatePosition(event, div.current.getBoundingClientRect(), handler.getItemBoundingClientRect(item), 0, 0) :
    { x: 0, y: 0 };

  const isComparison = subgroup === "comparison";

  const score = value && (isComparison ? value.scoreFoldChange : value["score" + subgroup]);
  const activity = value && (isComparison ? value.activityChange : value["activity" + subgroup]);  
  
  const scores = useMemo(() => {
    return isComparison ? compareValues(value, "scores", subgroupName) : subgroupValues(value, "scores" + subgroup);
  }, [value, subgroup, subgroupName, isComparison]);

  const activities = useMemo(() => {
    return isComparison ? compareValues(value, "activities", subgroupName) : subgroupValues(value, "activities" + subgroup);
  }, [value, subgroup, subgroupName, isComparison]);

  const scoreSpec = isComparison ? densityComparison : histogram;
  const activitySpec = isComparison ? barComparison : bar;

  const subtitle = isComparison ? subgroupName[0] + " vs. " + subgroupName[1] : subgroupName;

  return (
    <div
      ref={div}
      className="vegaTooltip shadow"
      style={{
        visibility: div.current && value ? "visible" : "hidden",
        top: y + "px",
        left: x + "px"
      }}
    >
      { value &&
        <Card>
          <Body>
            { <Subtitle>{ value.name }</Subtitle> }
            <div className="mt-1">{ subtitle }</div>
            <hr className="my-1"/>
            <div className="small">
              <div>
                { (isComparison ? "Score fold change: " : "Mean score: ") + formatNumber(score) }
                { isComparison && " (p-value: " + formatPValue(value.scorePValue) + ")"} 
              </div>
              <div>
                { (isComparison ? "Activity change: " : "Mean activity: ") + formatNumber(activity) }
                { isComparison && " (p-value: " + formatPValue(value.activityPValue) + ")" } 
              </div>
            </div>
            <hr className="my-1"/>
            { score || activity ? 
              <div className="text-center">            
                <small>Distributions</small>
                <div className="mb-2"></div>
                <VegaWrapper
                  spec={ scoreSpec }
                  data={ scores }
                  options={{ actions: false }}
                  signals={[
                    { name: "valueName", value: "score" }
                  ]}
                />
                <VegaWrapper
                  spec={ activitySpec }
                  data={ activities }
                  options={{ actions: false }}
                  signals={[
                    { name: "valueName", value: "activity" }
                  ]}
                />
              </div>
            : <div>No valid data</div> }
          </Body>
          { value.phenotype.length > 1 &&
            <Footer>
              <small>
                {value.phenotype.map((level, i) => (
                  <div key={ i } style={{ marginLeft: i + "em" }}>
                    { level }
                  </div>
                ))}
              </small>
            </Footer>
          }
        </Card>
      }
    </div>
  );
};