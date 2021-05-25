import React, { useMemo, useRef } from "react";
import { Card } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import * as d3 from "d3";
import { histogram, densityComparison, bar, barComparison } from "../../vega-specs";
import "./vega-tooltip.css";

const { Subtitle, Body, Footer } = Card;

// Borrowed from https://github.com/vega/vega-tooltip/
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

export const VegaTooltip = ({ handler, event, item, value, children }) => {
  const div = useRef();

  const { x, y } = event && div.current ?
    calculatePosition(event, div.current.getBoundingClientRect(), handler.getItemBoundingClientRect(item), 0, 0) :
    { x: 0, y: 0 };

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
      { value && React.cloneElement(children, { data: value }) }
    </div>
  );
};