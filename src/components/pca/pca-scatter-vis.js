import { useState, useMemo } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { ResizeWrapper } from "components/resize-wrapper";
import { VegaWrapper } from "components/vega-wrapper";
import { VegaTooltip } from "components/vega-tooltip";
import { DetailVis } from "components/detail-vis";
import { SelectedList } from "components/selected-list";
import { pcaScatterPlot } from "vega-specs";

const { Group, Label, Control, Select } = Form; 

const indexToComponent = index => `PC${ index + 1 }`;

export const PCAScatterVis = ({ data, subgroups }) => {
  const [xComponent, setXComponent] = useState(0);
  const [yComponent, setYComponent] = useState(1);
  //const hasSubgroups = subgroups[1] !== null;

  const pcaData = useMemo(() => { 
    return data.points.map(d => (
      { 
        x: d[xComponent], 
        y: d[yComponent]
      }
    ));
/*    
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
*/
}, [data, xComponent, yComponent]); 

  const onXComponentChange = event => {
    setXComponent(+event.target.value);
  };

  const onYComponentChange = event => {
    setYComponent(+event.target.value);
  }

  //const subtitle = subgroups[1] && (subgroups[0].name + " vs. " + subgroups[1].name);

  //const subgroup = "comparison";

  const subtitle = "";

  return (
    <>
      { /*
      <div className="mb-4">
        <Row>
          <Col>
            <SelectedList 
              nodes={ data } 
              subgroup="comparison"
              subgroupName={ [subgroups[0].name, subgroups[1].name] }
            />
          </Col>
        </Row>
      </div>
      */}
      <Row className="mb-4">
        <Group as={ Col } controlId="xComponentSelect"> 
          <Label size="sm">X component</Label>       
          <Select 
            size="sm"
            type="select"    
            value={ xComponent }
            onChange={ onXComponentChange } 
          >
            { new Array(data.size[1]).fill().map((d, i) => (
              <option 
                key={ i}
                value={ i }
              >
                { indexToComponent(i) }
              </option>
            ))}
          </Select>
        </Group>
        <Group as={ Col } controlId="yComponentSelect">        
          <Label size="sm">Y component</Label>     
          <Select 
            size="sm"
            type="select"    
            value={ yComponent }
            onChange={ onYComponentChange } 
          >
            { new Array(data.size[1]).fill().map((d, i) => (
              <option 
                key={ i}
                value={ i }
              >
                { indexToComponent(i) }
              </option>
            ))}
          </Select>
        </Group>
      </Row>
      <ResizeWrapper 
        useWidth={ true }
        useHeight={ true }
        minWidth={ 600 }
        aspectRatio={ 1.6 }
      >
        <VegaWrapper
          spec={ pcaScatterPlot } 
          data={ pcaData }
          signals={[
            { name: "subtitle", value: subtitle },
            { name: "xTitle", value: indexToComponent(xComponent) },
            { name: "yTitle", value: indexToComponent(yComponent) }
          ]}
          tooltip={ null /*
            <VegaTooltip>
              <DetailVis 
                subgroup={ subgroup } 
                subgroupName={ [subgroups[0].name, subgroups[1].name] } 
              />
            </VegaTooltip>            
          */}
        />           
      </ResizeWrapper>
    </>
  );
};           