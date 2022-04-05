import { useContext, useState, useMemo } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { ColorContext } from "contexts";
import { ResizeWrapper } from "components/resize-wrapper";
import { VegaWrapper } from "components/vega-wrapper";
import { pcaScatterPlot } from "vega-specs";

const { Group, Label, Select } = Form; 

const indexToComponent = index => `PC${ index + 1 }`;

export const PCAScatterVis = ({ data, subgroups }) => {
  const [{ subgroupColors }] = useContext(ColorContext);
  const [xComponent, setXComponent] = useState(0);
  const [yComponent, setYComponent] = useState(1);

  const pcaData = useMemo(() => { 
    if (subgroups) {
      const getPoints = which => {
        const subgroup = subgroups[which];
  
        return !subgroup ? [] : 
          subgroup.samples.map(sample => {
            const point = data.points[sample.index];
  
            return {
              x: point[xComponent],
              y: point[yComponent],
              subgroup: subgroup.name,
              color: subgroupColors[which]
            }
          });
      };

      return getPoints(0).concat(getPoints(1));
    }
    else {
      return data.points.map(point => {
        return {
          x: point[xComponent],
          y: point[yComponent],
          subgroup: "All",
          color: subgroupColors[0]
        }
      });
    }
  }, [data, subgroups, xComponent, yComponent]);

  const onXComponentChange = event => {
    setXComponent(+event.target.value);
  };

  const onYComponentChange = event => {
    setYComponent(+event.target.value);
  };

  return (
    <>
      <div className="mb-4">
        <Row>
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
      </div>
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
            { name: "xTitle", value: indexToComponent(xComponent) },
            { name: "yTitle", value: indexToComponent(yComponent) }
          ]}
        />           
      </ResizeWrapper>
    </>
  );
};           