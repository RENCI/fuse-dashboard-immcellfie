import React, { useContext, useState, useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { extent, min } from "d3-array";
import { DataContext } from "../../contexts";
import { ResizeWrapper } from "../resize-wrapper";
import { VegaWrapper } from "../vega-wrapper";
import { VegaTooltip } from "../vega-tooltip";
import { DetailVis } from "../detail-vis";
import { SubgroupsLink } from "../page-links";
import { WarningMessage } from "../warning-message";
import { SelectedList } from "../selected-list";
import { volcanoPlot } from "../../vega-specs";
import "./volcano-vis.css";

const { Group, Label, Control, Range } = Form; 

export const VolcanoVis = ({ data, subgroups }) => {
  const [, dataDispatch] = useContext(DataContext);
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
          "not significant",
        selected: node.data.selected,
        data: node.data
      };
    });
  }, [data, significanceLevel, foldChangeThreshold]);  
  
  const onSelectNode = (evt, item) => {
    if (!item || !item.datum) return;

    const name = item.datum.name;
    const selected = item.datum.selected;

    dataDispatch({ type: "selectNode", name: name, selected: !selected });
  };

  const foldChangeExtent = useMemo(() => {
    const ext = extent(volcanoData, data => data.foldChange);

    return Math.max(1 / Math.abs(ext[0]), Math.abs(ext[1]), foldChangeThreshold);
  }, [volcanoData, foldChangeThreshold]);

  const pValueExtent = useMemo(() => {
    return Math.min(min(volcanoData, data => data.pValue), significanceLevel);
  }, [volcanoData, significanceLevel]);

  const visibleData = volcanoData.filter(node => node.depth > 0 && node.depth <= depth);

  const subtitle = subgroups[1] && (subgroups[0].name + " vs. " + subgroups[1].name);

  const subgroup = "comparison";

  return (
    <>
      { subgroups[1] === null ? 
        <>
          <WarningMessage message="Only one subgroup present" />
          <div className="ms-3"><SubgroupsLink /></div>
        </>
      :
        <>
          <div className="mb-4">
            <Row className="mb-3">
              <Group as={ Col } controlId="depthSlider">
                <Label size="sm">Depth: { depth }</Label>        
                <Range 
                  size="sm"
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
            <Row>
              <Col>
                <SelectedList 
                  nodes={ data } 
                  subgroup="comparison"
                  subgroupName={ [subgroups[0].name, subgroups[1].name] }/>
              </Col>
            </Row>
          </div>
          <ResizeWrapper 
            useWidth={ true }
            useHeight={ true }
            minWidth={ 600 }
            aspectRatio={ 1.6 }
          >
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
              eventListeners={[
                { type: "click", callback: onSelectNode }
              ]}
              tooltip={ 
                <VegaTooltip>
                  <DetailVis 
                    subgroup={ subgroup } 
                    subgroupName={ [subgroups[0].name, subgroups[1].name] } 
                  />
                </VegaTooltip>
              }
            />           
          </ResizeWrapper>
        </>
      }
    </>
  );
};           