import React, { useState, useMemo } from "react";
import { Form, Col } from "react-bootstrap";
import * as d3 from "d3";
import { VegaWrapper } from "../vega-wrapper";
import { taskHeatmap } from "../../vega-specs";
import "./heatmap-vis.css";

const { Group, Label, Control, Row } = Form; 

export const HeatmapVis = ({ data, subgroups }) => {
  const [depth, setDepth] = useState(2);
  const [value, setValue] = useState("score");

  const onValueChange = evt => {
    const value = evt.target.value;

    setValue(value);
  };

  const heatmapData = useMemo(() => {
    const getValues = subgroup => {
      return d3.merge(data.filter(node => node.depth === depth).map(node => {
        const key = value === "score" ? "scores" + (subgroup + 1) : "activities" + (subgroup + 1);
        const subjects = d3.group(node.data[key], ({ index }) => index);
  
        return Array.from(subjects).map(subject => {
          return {
            name: node.data.name,
            subgroup: subgroups[subgroup].name,
            index: subject[0],
            value: d3.mean(subject[1], value => value.value)
          };
        });
      }));
    };

    return getValues(0).concat(getValues(1));
  }, [data, depth, value]);

  return (
    <>
      <div className="mb-4">
        <Row>
          <Group as={ Col } controlId="depthSlider">
            <Label size="sm">Depth: { depth }</Label>        
            <Control 
              size="sm"
              className="my-1"
              type="range"
              min={ 1 }
              max={ 3 }         
              value={ depth }
              onChange={ evt => setDepth(+evt.target.value) } 
            />
          </Group>
          <Group as={ Col } controlId="valueSelect">
            <Label size="sm">Value</Label>
            <Control
              size="sm"
              as="select"
              value={ value }
              onChange={ onValueChange }          
            >                          
              <option value="score">score</option>
              <option value="activity">activity</option>
            </Control>
          </Group>
        </Row>
      </div>
      <div style={{ overflowX: "scroll" }}>
        <VegaWrapper 
          spec={ taskHeatmap } 
          data={ heatmapData } 
        />
      </div>
    </>
  );
};           