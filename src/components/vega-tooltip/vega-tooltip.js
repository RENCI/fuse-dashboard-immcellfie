import React, { useState, useRef, useEffect } from "react";
import { Card } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import * as d3 from "d3";
import { histogram, density } from "../../vega-specs";
import "./vega-tooltip.css";

const { Title, Subtitle, Body, Text, Footer } = Card;

// Borrowed from vega-tooltip
const calculatePosition = (event, tooltipBox, offsetX, offsetY) => {
  let x = event.clientX + offsetX;

  if (x + tooltipBox.width > window.innerWidth) {
    x = +event.clientX - offsetX - tooltipBox.width;
  }

  let y = event.clientY + offsetY;

  if (y + tooltipBox.height > window.innerHeight) {
    y = +event.clientY - offsetY - tooltipBox.height;
  }

  return { x, y };
};

const format = d3.format(".2f")
const formatNumber = d => isNaN(d) ? "Inconclusive" : format(d);

export const VegaTooltip = ({ handler, event, item, value }) => {
  const [data, setData] = useState([]);
  const div = useRef();

  useEffect(() => {
    if (value) {
      setData(d3.merge(value.allScores.map(d => d.filter(d => !isNaN(d)).map(d => ({ value: d })))));
    }
  }, [value]);

  const { x, y } = event && div.current ? 
    calculatePosition(event, div.current.getBoundingClientRect(), 0, 0) : 
    { x: 0, y: 0 };

  const spec = value && value.allScores[0].length === 1 ? histogram : density;

  return (
    <div 
      ref={ div }
      className="vegaTooltip"
      style={{ 
        visibility: div.current && value ? "visible" : "hidden", 
        top: y + "px", 
        left: x + "px" 
      }}
    >   
      <Card>
        { value &&
          <Body>
            <Subtitle>{ value.name }</Subtitle>  
            <Text>    
              <div><small>Score: { formatNumber(value.score) }</small></div>
              <div><small>Activity: { formatNumber(value.activity) }</small></div>
            </Text>
          </Body> 
        }
        <Footer>
          <VegaWrapper
            spec={ spec } 
            data={ data } 
            options={{ actions: false }}
          />
        </Footer>
        { value && value.phenotype.length > 1 &&
          <Footer>
            <small>
              { value.phenotype.map((level, i) => (
                <div style={{ marginLeft: i + "em" }}>
                  { level }
                </div>
              ))}
            </small>
          </Footer>
        }
      </Card>
    </div>
  );
};