import React, { useState, useRef, useEffect } from "react";
import { Card } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import * as d3 from "d3";
import { histogram, density } from "../../vega-specs";
import "./vega-tooltip.css";

const { Subtitle, Body, Text, Footer } = Card;

// Borrowed from vega-tooltip
const calculatePosition = (event, tooltipBox, itemBox, offsetX, offsetY) => {
  let x = itemBox.x + (itemBox.width - tooltipBox.width) / 2 + offsetX;

  if (x + tooltipBox.width > window.innerWidth) {
    x = +event.clientX - offsetX - tooltipBox.width;
  }

  let y = itemBox.height + offsetY;

  if (y + tooltipBox.height > window.innerHeight) {
    y = +event.clientY - offsetY - tooltipBox.height;
  }

  return { x, y };
};

const format = d3.format(".2f")
const formatNumber = d => isNaN(d) ? "Inconclusive" : format(d);

const collectValues = allValues => {
  return d3.merge(allValues.map(values => values.filter(value => !isNaN(value)).map(value => ({ value: value }))));
};

export const VegaTooltip = ({ handler, event, item, value }) => {
  const [scores, setScores] = useState([]);
  const [activities, setActivities] = useState([]);
  const div = useRef();

  useEffect(() => {
    if (value) {
      setScores(collectValues(value.allScores));
      setActivities(collectValues(value.allActivities));
    }
  }, [value]);

  const { x, y } = event && div.current ?
    calculatePosition(event, div.current.getBoundingClientRect(), handler.getItemBoundingClientRect(item), 0, 0) :
    { x: 0, y: 0 };

  const spec = value && value.allScores[0].length === 1 ? histogram : density;

  return (
    <div
      ref={div}
      className="vegaTooltip"
      style={{
        visibility: div.current && value ? "visible" : "hidden",
        top: y + "px",
        left: x + "px"
      }}
    >
      <Card>
        <Body>
          {value && <Subtitle>{value.name}</Subtitle>}
          <Text className="mt-1">
            {value &&
              <small>
                <div>Mean score: {formatNumber(value.score)}</div>
                <div>Mean activity: {formatNumber(value.activity)}</div>
              </small>
            }
          </Text>
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
                <div style={{ marginLeft: i + "em" }}>
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