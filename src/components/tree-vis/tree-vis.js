import { useContext, useState, useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { scaleLinear, scaleLog } from "d3-scale";
import { extent, merge } from "d3-array";
import { ColorContext } from "contexts";
import styles from "./styles.module.css";

const { Group, Label, Control } = Form; 

export const TreeVis = ({ tree, subgroups }) => {
  const [
    { sequentialScales, divergingScales, sequentialScale, divergingScale }, 
    colorDispatch
  ] = useContext(ColorContext);
  const [update, setUpdate] = useState(false);

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: isComparison ? "diverging" : "sequential", 
      name: evt.target.value 
    });
  };

  const hasSubgroups = subgroups[1] !== null;
  const isComparison = hasSubgroups;

  const colorScales = isComparison ? divergingScales : sequentialScales;
  const colorScale = isComparison ? divergingScale : sequentialScale;

  // XXX: Copied from hierarchy-vis, maybe add a math utils?
  const logRange = values => {
    const ext = extent(values);

    const max = ext[0] > 0 ? Math.max(1 / ext[0], ext[1]) : ext[1];

    return [1 / max, max];
  };

  const scoreField = isComparison ? "scoreFoldChange" : "score1";
  const scoreDomain = useMemo(() => 
    isComparison ? logRange(tree.descendants().filter(node => node.height > 0).map(d => d.data[scoreField])) :
    extent(merge(tree.descendants().filter(node => node.height > 0).map(d => [d.data.score1, d.data.score2])))
  , [tree, isComparison, scoreField]);

  const activityField = isComparison ? "activityChange" : "activity1";
  const activityDomain = isComparison ? [-1, 1] : [0, 1];

  console.log(scoreDomain, activityDomain);


  const logScale = scaleLog().base(2)
    .domain([0.5, 1, 1.5, 2])
    .range([10, 20, 30, 40]);

    console.log(0.75, logScale(0.5));
    console.log(1.25, logScale(1.25));
    console.log(1.75, logScale(1.75));
    console.log(2, logScale(2));

  const steps = ([min, max], n) =>
    new Array(n).fill().map((d, i) => {
      //const x = Math.pow(2, i) / Math.pow(2, n - 1);
      const x = i / (n - 1);

      /*
      console.log(min, max);

      const x = Math.pow(2, i / n);

      console.log(x);

      const v = min + x * (max - min);
      return v;
      */

      return Math.log2(min + x * (max - min));
    });

    console.log(steps(scoreDomain, colorScale.values.length));

  const scales = {
    score: scaleLinear()
      .domain(steps(scoreDomain, colorScale.values.length))
      .range(colorScale.values),
    activity: scaleLinear()
      .domain(steps(activityDomain, colorScale.values.length))
      .range(colorScale.values),
  };

  const getColor = (value, scale) => value === "na" ? colorScale.inconclusive : scale(Math.log2(value));

  console.log(tree);

  const valueGlyph = (data, type) => {
    const field = type === "score" ? scoreField : activityField;

    return (
      <td>
        <div 
          className={ styles.value }
          style={{
            backgroundColor: getColor(data[field], scales[type])
          }}
        />
      </td>
    );
  };

  const headers = ["Task", "Score", "Activity"].map(header => <th key={ header }>{ header }</th>);

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
            paddingTop: height * 5,
            paddingLeft: depth * 20,
            fontSize: 12 + height * 1,
            cursor: isLeaf ? "default" : "pointer"
          }}
        >{ name }
        </td>
        { valueGlyph(node.data, "score") }
        { valueGlyph(node.data, "activity") }
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
              value={ colorScale.scheme }
              onChange={ onColorMapChange }          
            >
              { colorScales.map(({ scheme, name }, i) => (
                <option key={ i } value={ scheme }>{ name }</option>
              ))}
            </Control>
          </Group>
        </Row>
      </div>
      <table className={ styles.table }>
        <thead>
          <tr>{ headers }</tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
    </>
  );
};           