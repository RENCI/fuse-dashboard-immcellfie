import React, { useMemo, useRef } from "react";
import { Card } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import * as d3 from "d3";
import { histogram, density, line } from "../../vega-specs";
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

const format = d3.format(".2f")
const formatNumber = d => isNaN(d) ? "Inconclusive" : format(d);

const subgroupValues = (value, key) => {  
  return value ? value[key].filter(value => !isNaN(value)).map(value => ({ value: value })) : [];
};

const compareValues = (value, key, names) => {
  return value ? d3.merge(
    names.map((subgroup, i) => value[key + (i + 1)].filter(value => !isNaN(value)).map(value => ({ value: value, subgroup: subgroup })))
  ) : [];
}

export const VegaTooltip = ({ handler, event, item, value, subgroup, subgroupName }) => {
  const div = useRef();

  const { x, y } = event && div.current ?
    calculatePosition(event, div.current.getBoundingClientRect(), handler.getItemBoundingClientRect(item), 0, 0) :
    { x: 0, y: 0 };

  const isComparison = subgroup === "comparison";

  const score = value && (isComparison ? value.scoreFoldChange : value["score" + subgroup]);
  const activity = value && (isComparison ? value.activityFoldChange : value["activity" + subgroup]);

  const scores = useMemo(() => {
    return isComparison ? compareValues(value, "scores", subgroupName) : subgroupValues(value, "scores" + subgroup);
  }, [value, subgroup, subgroupName, isComparison]);

  const activities = useMemo(() => {
    return isComparison ? compareValues(value, "activities", subgroupName) : subgroupValues(value, "activities" + subgroup);
  }, [value, subgroup, subgroupName, isComparison]);

  const spec = isComparison ? line : (value && value.allScores[0].length === 1) ? histogram : density;

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
      <Card>
        <Body>
          { value && <Subtitle>{ value.name }</Subtitle> }
          <div>{ subtitle }</div>
          <div className="small">
            { (isComparison ? "Score fold change: " : "Mean score: ") + formatNumber(score) }
          </div>
          <div className="small">
            { (isComparison ? "Activity fold change: " : "Mean activity: ") + formatNumber(activity) }
          </div>
          <div className="text-center">
            <small>Distributions</small>
            <VegaWrapper
              spec={spec}
              data={scores}
              options={{ actions: false }}
              signals={[
                { name: "valueName", value: "score" }
              ]}
            />
            <VegaWrapper
              spec={spec}
              data={activities}
              options={{ actions: false }}
              signals={[
                { name: "valueName", value: "activity" }
              ]}
            />
          </div>
        </Body>
        {value && value.phenotype.length > 1 &&
          <Footer>
            <small>
              {value.phenotype.map((level, i) => (
                <div key={ i } style={{ marginLeft: i + "em" }}>
                  { level}
                </div>
              ))}
            </small>
          </Footer>
        }
      </Card>
    </div>
  );
};