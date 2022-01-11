import { useContext, useState, useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { merge, group, mean } from "d3-array";
import { ColorContext } from "../../contexts";
import { VegaWrapper } from "../vega-wrapper";
import { taskHeatmap } from "../../vega-specs";
import "./heatmap-vis.css";

const { Group, Label, Control, Range } = Form; 

export const HeatmapVis = ({ data, subgroups }) => {
  const [{ sequentialScales, sequentialScale }, colorDispatch] = useContext(ColorContext);
  const [depth, setDepth] = useState(2);
  const [value, setValue] = useState("score");
  const [sortBy, setSortBy] = useState("mean");

  const onDepthChange = evt => {
    setDepth(+evt.target.value)
  };

  const onValueChange = evt => {
    setValue(evt.target.value);
  };

  const onSortByChange = evt => {
    setSortBy(evt.target.value);
  };

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: "sequential", 
      name: evt.target.value 
    });
  };

  const heatmapData = useMemo(() => {
    const getValues = subgroup => {
      return merge(data.filter(node => node.depth === depth).map(node => {
        const key = value === "score" ? "scores" + (subgroup + 1) : "activities" + (subgroup + 1);
        const samples = group(node.data[key], ({ index }) => index);
  
        return Array.from(samples).map(sample => {
          return {
            name: node.data.name,
            subgroup: subgroups[subgroup].name,
            index: sample[0],
            value: mean(sample[1], value => value.value)
          };
        });
      }));
    };

    return getValues(0).concat(getValues(1));
  }, [data, subgroups, depth, value]);

  return (
    <>
      <div className="mb-4">
        <Row>
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
          <Group as={ Col } controlId="sortBySelect">
            <Label size="sm">Sort by</Label>
            <Control
              size="sm"
              as="select"
              value={ sortBy }
              onChange={ onSortByChange }          
            >                          
              <option value="mean">mean</option>
              <option value="median">median</option>
              <option value="max">max</option>
            </Control>
          </Group>
          <Group as={ Col } controlId="colorMapSelect">
            <Label size="sm">Color map</Label>
            <Control
              size="sm"
              as="select"
              value={ sequentialScale.scheme }
              onChange={ onColorMapChange }          
            >
              { sequentialScales.map(({ scheme, name }, i) => (
                <option key={ i } value={ scheme }>{ name }</option>
              ))}
            </Control>
          </Group>
        </Row>
      </div>
      <div style={{ overflowX: "auto" }}>
        <VegaWrapper 
          spec={ taskHeatmap } 
          data={ heatmapData }             
          signals={[
            { name: "value", value: value },
            { name: "sortBy", value: sortBy },
            { name: "colorScheme", value: sequentialScale.scheme },
            { name: "reverseColors", value: sequentialScale.reverse },
            { name: "highlightColor", value: sequentialScale.highlight },
            { name: "inconclusiveColor", value: sequentialScale.inconclusive }
          ]}
        />
      </div>
    </>
  );
};           