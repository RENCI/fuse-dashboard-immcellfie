import { useContext, useState, useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { scaleLinear, scaleLog } from "d3-scale";
import { extent, merge } from "d3-array";
import { DataContext, ColorContext } from "contexts";
import styles from "./styles.module.css";

const { Group, Label, Control } = Form; 

export const TreeVis = ({ tree, subgroups }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [
    { sequentialScales, divergingScales, sequentialScale, divergingScale }, 
    colorDispatch
  ] = useContext(ColorContext);
  const [subgroup, setSubgroup] = useState(subgroups[1] ? "comparison" : "1");
  const [update, setUpdate] = useState(false);

  const onSubgroupChange = evt => {
    const value = evt.target.value;

    setSubgroup(value);
  };

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: isComparison ? "diverging" : "sequential", 
      name: evt.target.value 
    });
  };

  const hasSubgroups = subgroups[1] !== null;
  const isComparison = subgroup === "comparison";

  const colorScales = isComparison ? divergingScales : sequentialScales;
  const colorScale = isComparison ? divergingScale : sequentialScale;

  // XXX: Copied from hierarchy-vis, maybe add a math utils?
  const logRange = values => {
    const ext = extent(values);

    const max = ext[0] > 0 ? Math.max(1 / ext[0], ext[1]) : ext[1];

    return [1 / max, max];
  };

  const scoreField = isComparison ? "scoreFoldChange" : "score" + subgroup;
  const scoreDomain = useMemo(() => 
    isComparison ? logRange(tree.descendants().filter(node => node.height > 0).map(d => d.data[scoreField])) :
    extent(merge(tree.descendants().filter(node => node.height > 0).map(d => [d.data.score1, d.data.score2])))
  , [tree, isComparison, scoreField]);

  const activityField = isComparison ? "activityChange" : "activity" + subgroup;
  const activityDomain = isComparison ? [-1, 1] : [0, 1];

  const steps = ([min, max], n, useLog = false) => {
    const s = useLog ? Math.log2(min) : min;
    const f = useLog ? Math.log2(max) : max;

    return new Array(n).fill().map((d, i) => {
      const x = s + i / (n - 1) * (f - s);

      return useLog ? Math.pow(2, x) : x;
    });
  };

  const scales = {
    score: (isComparison ? scaleLog().base(2) : scaleLinear())
      .domain(steps(scoreDomain, colorScale.values.length, isComparison))
      .range(colorScale.values),
    activity: scaleLinear()
      .domain(steps(activityDomain, colorScale.values.length))
      .range(colorScale.values),
    pValue: scaleLog().base(10)
      .domain([0.01, 1])
      .range(["#000", "#fff"]),
    pValueWidth: scaleLog().base(10)
      .domain([0.01, 1])
      .range([0, 2])
  };

  const getColor = (value, scale) => value === "na" ? colorScale.inconclusive : scale(value);

  const valueGlyph = (data, type, paddingTop) => {
    const field = type === "score" ? scoreField : activityField;
    const p = data[type + "PValue"];

    return (
      <td style={{ paddingTop: paddingTop }}>
        <div 
          className={ styles.value }
          style={{
            backgroundColor: getColor(data[field], scales[type]),
            border: isComparison ? `${ scales.pValueWidth(p) }px solid ${ scales.pValue(p) }`: null
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

    const paddingTop = height * 5;
    const selected = node.data.selected;
    const descendantSelected = Boolean(node.find(n => n !== node && n.data.selected, false));

    rows.push(
      <tr 
        key={ name } 
        style={{ 
          cursor: isLeaf ? "default" : "pointer",
        }}
        onClick={ isLeaf ? null : () => {
          node.data.showChildren = !node.data.showChildren;
          setUpdate(!update);
        }}
      >
        <td
          style={{ 
            paddingTop: paddingTop,
            paddingLeft: depth * 20,
            fontSize: 12 + height * 1
          }}
        >
          { descendantSelected && <span style={{ color: colorScale.highlight }}>▼ </span> }          
          <span
            style={{ 
              borderBottom: selected ? "2px solid " + colorScale.highlight : null
            }}
          >
            { name }
          </span>
        </td>
        { valueGlyph(node.data, "score", paddingTop) }
        { valueGlyph(node.data, "activity", paddingTop) }
      </tr>
    );

    if (node.children && node.data.showChildren) node.children.forEach(traverseTree);
  };

  tree.children.forEach(traverseTree);

  return (
    <>
      <div className="mb-4">
        <Row>
          <Group as={ Col } controlId="subgroupSelect">
            <Label size="sm">Subgroup</Label>
            <Control
              size="sm"
              as="select"
              value={ subgroup }
              onChange={ onSubgroupChange }          
            >
              { hasSubgroups && <option value="comparison">{ subgroups[0].name + " vs. " + subgroups[1].name}</option> }
              <option value="1">{ subgroups[0].name }</option>
              { hasSubgroups && <option value="2">{ subgroups[1].name }</option> }
            </Control>
          </Group>
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