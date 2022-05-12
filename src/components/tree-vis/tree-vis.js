import { useContext, useState, useMemo } from "react";
import { Form, Row, Col, Table } from "react-bootstrap";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { ColorContext } from "contexts";
import styles from "./styles.module.css";

const { Group, Label, Control, Range } = Form; 

export const TreeVis = ({ tree, subgroups }) => {
  const [{ sequentialScales, sequentialScale }, colorDispatch] = useContext(ColorContext);
  const [update, setUpdate] = useState(false);

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: "sequential", 
      name: evt.target.value 
    });
  };

  const maxScore = useMemo(() => max(tree.descendants().filter(node => node.height > 0), node => max([node.data.score1, node.data.score2])), [tree]);

  const steps = (maxValue, n) => new Array(n).fill().map((d, i) => i / (n - 1) * maxValue);

  const scoreScale = scaleLinear()
    .domain(steps(maxScore, sequentialScale.values.length))
    .range(sequentialScale.values);

  const activityScale = scaleLinear()
    .domain(steps(1, sequentialScale.values.length))
    .range(sequentialScale.values);

  const getColor = (value, scale) => value === "na" ? sequentialScale.inconclusive : scale(value);

  const rows = [];

  const traverseTree = node => {
    const name = node.data.name;
    const height = node.height - 1;
    const depth = node.depth - 1;
    const isLeaf = depth === 2;

    rows.push(
      <tr 
        key={ name } 
        onClick={ isLeaf ? null : () => {
          node.data.showChildren = !node.data.showChildren;
          setUpdate(!update);
        }}
      >
        <td
          style={{ 
            paddingTop: height * 10,
            paddingLeft: depth * 20,
            fontSize: 12 + height * 1,
            cursor: isLeaf ? "default" : "pointer"
          }}
        >
          { name }
        </td>
        <td className={ styles.value } style={{ backgroundColor: getColor(node.data.score1, scoreScale), }}></td>
        { node.data.score2 && <td className={ styles.value } style={{ backgroundColor: getColor(node.data.score2, scoreScale) }}></td> }
        <td className={ styles.value } style={{ backgroundColor: getColor(node.data.activity1, activityScale) }}></td>
        { node.data.activity2 && <td className={ styles.value } style={{ backgroundColor: getColor(node.data.activity2, activityScale) }}></td> }
      </tr>
    );

    if (node.children && node.data.showChildren) node.children.forEach(traverseTree);
  };

  tree.children.forEach(traverseTree);
  /*
  tree.eachBefore(node => {
    if (node.depth === 0 || node.depth > 3) return;

    const name = node.data.name;
    const height = node.height - 1;
    const depth = node.depth - 1

    rows.push(
      <div 
        key={ name } 
        style={{ 
          marginTop: height * 10,
          marginLeft: depth * 20,
          fontSize: 12 + height * 1
        }}
      >
        { name }
      </div>
    );
  });
  */


/*
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
*/  

  return (
    <>
      <div className="mb-4">
        <Row>
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
      <Table borderless>
        <tbody>
          { rows }
        </tbody>
      </Table>
    </>
  );
};           