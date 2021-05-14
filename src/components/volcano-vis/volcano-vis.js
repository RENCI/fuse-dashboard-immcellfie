import React, { useState, useMemo } from "react";
import { Form, Col } from "react-bootstrap";
import * as d3 from "d3";
import { VegaWrapper } from "../vega-wrapper";
import { volcanoPlot } from "../../vega-specs";
import { SubgroupsLink } from "../page-links";
import "./volcano-vis.css";

const { Group, Label, Control, Row } = Form; 

export const VolcanoVis = ({ data, subgroups }) => {
  const [depth, setDepth] = useState(3);
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(1.5);

  const onDepthChange = evt => {
    setDepth(+evt.target.value);
  };

  const onSignificanceLevelChange = evt => {
    setSignificanceLevel(+evt.target.value);
  };

  const onFoldChangeThresholdChange = evt => {
    setFoldChangeThreshold(+evt.target.value);
  };

  const log = x => Math.log10(x);

  const volcanoData = useMemo(() => {
    return data.filter(node => node.depth > 0).map(node => {
      const foldChange = node.data.scoreFoldChange;
      const pValue = node.data.scorePValue;

      return {
        name: node.data.name,
        foldChange: foldChange,
        logFoldChange: log(foldChange),
        pValue: pValue,
        logPValue: -log(pValue),
        depth: node.depth,
        category: pValue > significanceLevel ? "not significant" :
          foldChange >= foldChangeThreshold ? "up" :  
          foldChange <= 1 / foldChangeThreshold ? "down" :
          "not significant"
      };
    });
  }, [data, significanceLevel, foldChangeThreshold]);

  const foldChangeExtent = useMemo(() => {
    const extent = d3.extent(volcanoData, data => data.foldChange);

    return Math.max(1 / Math.abs(extent[0]), Math.abs(extent[1]), foldChangeThreshold);
  }, [volcanoData, foldChangeThreshold]);

  const pValueExtent = useMemo(() => {
    return Math.min(d3.min(volcanoData, data => data.pValue), significanceLevel);
  }, [volcanoData, significanceLevel]);

  const visibleData = volcanoData.filter(node => node.depth > 0 && node.depth <= depth);

  const subtitle = subgroups[0].name + " vs. " + subgroups[1].name;

  return (
    <>
      { subgroups[1] === null ? 
        <>
          <h5>Only one subgroup present</h5>
          <SubgroupsLink />
        </>
      :
        <>
          <div className="mb-4">
            <Row>
              <Group as={ Col } controlId="depthSlider">
                <Label size="sm">Depth: { depth }</Label>        
                <Control 
                  size="sm"
                  className="mt-2"
                  type="range"
                  min={ 1 }
                  max={ 3 }         
                  value={ depth }
                  onChange={ onDepthChange } 
                />
              </Group>
              <Group as={ Col } controlId="significanceLevelSlider">
                <Label size="sm">Significance level</Label>        
                <Control 
                  size="sm"
                  type="number"
                  min={ 0.005 }
                  max={ 1 }  
                  step={ 0.005 }      
                  value={ significanceLevel }
                  onChange={ onSignificanceLevelChange } 
                />
              </Group>
              <Group as={ Col } controlId="foldChangeThresholdSlider">
                <Label size="sm">Fold change threshold</Label>        
                <Control 
                  size="sm"
                  type="number"
                  min={ 1 }
                  max={ Number.MAX_VALUE }   
                  step={ 0.01 }      
                  value={ foldChangeThreshold }
                  onChange={ onFoldChangeThresholdChange } 
                />
              </Group>
            </Row>
          </div>
          <VegaWrapper 
            spec={ volcanoPlot } 
            data={ visibleData }
            signals={[
              { name: "subtitle", value: subtitle },
              { name: "logFoldChangeExtent", value: log(foldChangeExtent) },
              { name: "logPValueExtent", value: -log(pValueExtent) },
              { name: "logSignificanceLevel", value: -log(significanceLevel) },
              { name: "logFoldChangeThreshold", value: log(foldChangeThreshold) }
            ]}
          />
        </>
      }
    </>
  );
};           