import React, { useState, useMemo } from "react";
import { Form, Col } from "react-bootstrap";
import * as d3 from "d3";
import { VegaWrapper } from "../vega-wrapper";
import { taskHeatmap } from "../../vega-specs";
import "./heatmap-vis.css";

const { Group, Label, Control, Row } = Form; 

export const HeatmapVis = ({ data, subgroups }) => {
  const [depth, setDepth] = useState(1);
  const [subgroup, setSubgroup] = useState("1");
  const [value, setValue] = useState("score");

  const hasSubgroups = subgroups[1] !== null;

  const isComparison = subgroup === "comparison";

  console.log(data);

  const onSubgroupChange = evt => {
    const value = evt.target.value;

    setSubgroup(value);
  };

  const onValueChange = evt => {
    const value = evt.target.value;

    setValue(value);
  };

  const heatmapData = useMemo(() => {
    return d3.merge(data.filter(node => node.depth === depth).map(node => {
      const subjects = d3.group(node.data.scores1, ({ index }) => index);

      return Array.from(subjects).map(subject => {
        return {
          name: node.data.name,
          index: subject[0],
          value: d3.mean(subject[1], value => value.value)
        };
      });
    }));
  }, [data, depth]);

console.log(heatmapData);

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
          <Group as={ Col } controlId="subgroupSelect">
            <Label size="sm">Subgroup</Label>
            <Control
              size="sm"
              as="select"
              value={ subgroup }
              onChange={ onSubgroupChange }          
            >
              <option value="1">{ subgroups[0].name }</option>
              { hasSubgroups && <option value="2">{ subgroups[1].name }</option> }
              { hasSubgroups && <option value="comparison">comparison</option> }
            </Control>
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
      <VegaWrapper 
        spec={ taskHeatmap } 
        data={ heatmapData } 
      />
    </>
  );
};           