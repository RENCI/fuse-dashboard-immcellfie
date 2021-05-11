import React, { useState, useMemo } from "react";
import { Form, Col } from "react-bootstrap";
import * as d3 from "d3";
import { VegaWrapper } from "../vega-wrapper";
import { volcanoPlot } from "../../vega-specs";
import "./volcano-vis.css";

const { Group, Label, Control, Row } = Form; 

export const VolcanoVis = ({ data }) => {
  const [depth, setDepth] = useState(3);
  const [significanceLevel, setSignificanceLevel] = useState(0.02);

  const onDepthChange = evt => {
    setDepth(+evt.target.value);
  };

  const onSignificanceLevelChange = evt => {
    setSignificanceLevel(+evt.target.value);
  };

  const volcanoData = useMemo(() => {
    return data.filter(node => node.depth > 0).map(node => {
      const foldChange = node.data.scoreFoldChange;
      const pValue = node.data.scorePValue;

      return {
        name: node.data.name,
        foldChange: foldChange,
        logFoldChange: Math.log10(foldChange),
        pValue: pValue,
        logPValue: -Math.log10(pValue),
        depth: node.depth,
        significance: pValue > significanceLevel ? 0 : foldChange < 1 ? 1 : 2
      };
    });
  }, [data, significanceLevel]);

  const foldChangeExtent = useMemo(() => {
    const extent = d3.extent(volcanoData, data => data.logFoldChange);

    return Math.max(Math.abs(extent[0]), Math.abs(extent[1]));
  }, [volcanoData]);

  const visibleData = volcanoData.filter(node => node.depth > 0 && node.depth <= depth);

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
              onChange={ onDepthChange } 
            />
          </Group>
          <Group as={ Col } controlId="significanceLevelSlider">
            <Label size="sm">Significance level: { significanceLevel }</Label>        
            <Control 
              size="sm"
              className="my-1"
              type="range"
              min={ 0.005 }
              max={ 0.1 }   
              step={ 0.005 }      
              value={ significanceLevel }
              onChange={ onSignificanceLevelChange } 
            />
          </Group>
        </Row>
      </div>
      <VegaWrapper 
        spec={ volcanoPlot } 
        data={ visibleData }
        signals={[
          { name: "foldChangeExtent", value: foldChangeExtent },
          { name: "logSignificanceLevel", value: -Math.log10(significanceLevel) }
        ]}
      />
    </>
  );
};           