import { useContext, useState } from "react";
import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import { scaleLinear, scaleLog } from "d3-scale";
import { extent, merge } from "d3-array";
import { DataContext, ColorContext } from "contexts";
import { TextHighlight } from "components/text-highlight";
import { VegaWrapper } from "components/vega-wrapper";
import { TaskSearch } from "./task-search";
import { legend } from "vega-specs";
import styles from "./styles.module.css";

const { Group, Label, Control } = Form; 

// Based on: https://css-tricks.com/snippets/javascript/lighten-darken-color/
function adjustColor(color, amount) {
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amount;
  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  let b = ((num >> 8) & 0x00FF) + amount;
  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  let g = (num & 0x0000FF) + amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

export const TreeVis = ({ tree, subgroups }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [
    { sequentialScales, divergingScales, sequentialScale, divergingScale }, 
    colorDispatch
  ] = useContext(ColorContext);
  const [subgroup, setSubgroup] = useState(subgroups[1] ? "comparison" : "1");
  const [update, setUpdate] = useState(false);
  const [search, setSearch] = useState("");

  const nodes = tree.descendants().filter(node => node.depth > 0 && node.height > 0);

  const onShowDepthClick = depth => {
    tree.descendants().forEach(node => node.data.showChildren = node.depth <= depth - 1);
    setUpdate(!update);
  };

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

  const onSelectNode = node => {
    dataDispatch({ type: "selectNode", name: node.data.name, selected: !node.data.selected });
  };

  const onTaskSearch = text => {
    const lower = text.toLowerCase();

    nodes.forEach(node => node.data.showChildren = false);

    if (text !== "") {
      nodes.forEach(node => {
        if (node.data.name.toLowerCase().includes(lower)) {
          node.ancestors().filter(n => n.parent).forEach(node => node.parent.data.showChildren = true);
        }      
      });
    }

    setSearch(text);
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

  const isVisible = node =>
    node.ancestors().filter(n => n !== node).reduce((show, node) => show && node.data.showChildren, true);

  const scoreField = isComparison ? "scoreFoldChange" : "score" + subgroup;
  const scoreDomain = isComparison ? logRange(nodes.filter(isVisible).map(d => d.data[scoreField])) :
    extent(merge(nodes.filter(isVisible).map(d => [d.data.score1, d.data.score2])));

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

  const valueGlyph = (data, type, padding) => {
    const field = type === "score" ? scoreField : activityField;
    const p = data[type + "PValue"];

    return (
      <td 
        style={{ 
          paddingTop: padding,
          paddingBottom: padding 
        }}
      >
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

  const headers = ["Task", "Score", "Activity"].map((header, i) => <th key={ i }>{ header }</th>);

  const rows = [];
  const traverseTree = node => {
    const name = node.data.name;
    const height = node.height - 1;
    const depth = node.depth - 1;
    const isLeaf = height === 0;

    const padding = height * 2;
    const selected = node.data.selected;
    const descendantSelected = Boolean(node.find(n => n !== node && n.data.selected, false));

    const searchColor = adjustColor(colorScale.highlight, 180);

    rows.push(
      <tr key={ name }>
        <td
          style={{ 
            paddingTop: padding,
            paddingBottom: padding,
            paddingLeft: depth * 20,
            fontSize: 12 + height * 1
          }}
        >          
          { isLeaf ? null : 
            <span
              className="me-1"
              style={{ 
                float: "left",
                cursor: "pointer",
                color: descendantSelected ? colorScale.highlight : null,
                transform: !node.data.showChildren ? "rotate(-90deg)" : null
              }}
              onClick={ isLeaf ? null : () => {
                node.data.showChildren = !node.data.showChildren;
                setUpdate(!update);
              }}
            >
              { descendantSelected ? "▼" : "▽" } 
            </span> 
          }
          <span
            style={{ 
              cursor: "pointer",
              borderBottom: selected ? "2px solid " + colorScale.highlight : null
            }}
            onClick={ () => onSelectNode(node) }
          >
            <TextHighlight 
              text={ name } 
              highlight={ search }  
              style={{ backgroundColor: searchColor }}
            />
          </span>
        </td>
        { valueGlyph(node.data, "score", padding) }
        { valueGlyph(node.data, "activity", padding) }
      </tr>
    );

    if (node.children && node.data.showChildren) node.children.forEach(traverseTree);
  };

  tree.children.forEach(traverseTree);

  return (
    <>
      <div className="mb-4">
        <Row>
          <TaskSearch 
            nodes={ nodes } 
            onSearch={ onTaskSearch } 
          />
          <Group as={ Col } controlId="subgroupSelect">
            <Label size="sm">Depth</Label>
            <div>
            <ButtonGroup size="sm">
              { [1, 2, 3].map(depth => (
                <Button 
                  key={ depth }
                  variant="outline-secondary" 
                  onClick={ () => onShowDepthClick(depth) }
                >
                  { depth }
                </Button>
              ))}
            </ButtonGroup>
            </div>
          </Group>
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
      <VegaWrapper 
        spec={ legend } 
        data={ [] } 
      />
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