import { useContext, useState, useEffect } from "react";
import { Form, Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { randomUniform, randomLcg } from "d3-random";
import { range, extent, merge } from "d3-array";
import { line } from "d3-shape";
import { DataContext, ColorContext } from "contexts";
import { voronoiTreemap as d3VoronoiTreemap } from "d3-voronoi-treemap";
import { ResizeWrapper } from "components/resize-wrapper";
import { VegaWrapper } from "components/vega-wrapper";
import { VegaTooltip } from "components/vega-tooltip";
import { DetailVis } from "components/detail-vis";
import { LoadingSpinner } from "components/loading-spinner";
import { SelectedList } from "components/selected-list";
import { 
  treemap, treemapLogScale, treemapPValue,
  enclosure, enclosureLogScale, enclosurePValue,
  voronoiTreemap, voronoiTreemapLogScale, voronoiTreemapPValue
} from "vega-specs";

const { Group, Label, Control, Range } = Form; 

const visualizations = [
  {
    name: "treemap",
    label: "Treemap",
    spec: treemap,
    foldChangeSpec: treemapLogScale,
    pValueSpec: treemapPValue
  },
  {
    name: "enclosure",
    label: "Enclosure diagram",
    spec: enclosure,
    foldChangeSpec: enclosureLogScale,
    pValueSpec: enclosurePValue
  },
  {
    name: "voronoi",
    label: "Voronoi treemap",
    spec: voronoiTreemap,
    foldChangeSpec: voronoiTreemapLogScale,
    pValueSpec: voronoiTreemapPValue
  }
];

export const HierarchyVis = ({ hierarchy, tree, subgroups }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [
    { sequentialScales, divergingScales, sequentialScale, divergingScale }, 
    colorDispatch
  ] = useContext(ColorContext);
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(1);
  const [subgroup, setSubgroup] = useState(subgroups[1] ? "comparison" : "1");
  const [value, setValue] = useState("score");
  const [vis, setVis] = useState(visualizations[0]);

  const hasSubgroups = subgroups[1] !== null;
  const isComparison = subgroup === "comparison";

  const hasVoronoi = tree.descendants()[0].polygon;

  const colorScales = isComparison ? divergingScales : sequentialScales;
  const colorScale = isComparison ? divergingScale : sequentialScale;

  const onVisChange = value => {
    setLoading(true);

    const vis = visualizations.find(({ name }) => name === value);

    setVis(vis);
  };

  const onSubgroupChange = evt => {
    const value = evt.target.value;

    setSubgroup(value);
  };

  const onValueChange = evt => {
    const value = evt.target.value;

    setValue(value);
  };

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: isComparison ? "diverging" : "sequential", 
      name: evt.target.value 
    });
  };

  const onSelectNode = (evt, item) => {
    if (!item || !item.datum) return;

    const data = item.datum.data ? item.datum.data : item.datum;

    dataDispatch({ type: "selectNode", name: data.name, selected: !data.selected });
  };

  useEffect(() => {
    if (vis.name === "voronoi" && !hasVoronoi) {
      // Create Voronoi diagram, use setTimout so loading state can update
      setTimeout(() => {
        const prng = randomUniform.source(randomLcg(0.2))();

        const n = 64;
        const clip = range(0, n).map(d => {
          return [
            Math.cos(d / n * Math.PI * 2),
            Math.sin(d / n * Math.PI * 2)
          ];
        });

        tree
          .count()
          .sort((a, b) => b.height - a.height || b.data.score - a.data.score);

        const voronoi = d3VoronoiTreemap()
          .clip(clip)
          .prng(prng)
          .maxIterationCount(10);

        voronoi(tree);

        const lineShape = line();

        tree.each(node => {
          node.path = lineShape(node.polygon) + "z";
        });

        setLoading(false);
      }, 10);      
    }
    else {
      setLoading(false);
    }
  }, [vis, tree, hasVoronoi]);

  const logRange = values => {
    const ext = extent(values);

    const max = ext[0] > 0 ? Math.max(1 / ext[0], ext[1]) : ext[1];

    return [1 / max, max];
  };

  const valueField = !isComparison ? value + subgroup : value === "score" ? "scoreFoldChange" : "activityChange";

  const domain = value === "activity" ? (isComparison ? [-1, 1] : [0, 1]) :
    isComparison ? logRange(tree.descendants().filter(d => d.depth === Math.min(depth, 3)).map(d => d.data[valueField])) :
    extent(merge(tree.descendants().filter(d => d.depth === depth).map(d => [d.data.score1, d.data.score2])));

  const subtitle = isComparison ? 
    (subgroups[0].name + " vs. " + subgroups[1].name) : 
    subgroup === "1" ? subgroups[0].name : 
    subgroups[1].name;

  const legendTitle = isComparison ?
    (value === "score" ? ["score", "fold change"] : ["activity", "change"]) :
    value;

  const specType = isComparison ? (value === "score" ? "foldChange" : "pValue") : "normal";

  const strokeField = isComparison ? (value === "score" ? "scorePValue" : "activityPValue") : "depth";

  const subgroupName = isComparison ? 
    [subgroups[0].name, subgroups[1].name] : 
    subgroup === "1" ? subgroups[0].name : 
    subgroups[1].name;

  return (
    <>
      <div className="mb-4">
        <Row className="mb-3">
          <Group as={ Col } controlId="visualizationButtons">
            <ToggleButtonGroup 
              type="radio"
              name="visButtons"
              value={ vis.name }
              onChange={ onVisChange }
            >
              { visualizations.map(({ name, label }, i) => (
                <ToggleButton 
                  key={ i }
                  id={ `visButton_${ name }` }
                  variant="outline-primary"
                  value={ name }
                >
                  { label }
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Group>
        </Row>
        <Row className="mb-3">
          <Group as={ Col } controlId="depthSlider">
            <Label size="sm">Depth: { depth }</Label>        
            <Range 
              size="sm"
              min={ 1 }
              max={ subgroup === "comparison" ? 3 : 4 }         
              value={ depth }
              onChange={ evt => setDepth(+evt.target.value) } 
            />
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
        <Row>
          <Col>
            <SelectedList 
              nodes={ tree.descendants() }
              subgroup={ subgroup }
              subgroupName={ subgroupName }
            />
          </Col>
        </Row>
      </div>
      <>
        { loading ? <LoadingSpinner /> :
          <ResizeWrapper
            useWidth={ true }
            useHeight={ true }
            minWidth={ 600 }
            aspectRatio={ 1.4 }
          > 
            <VegaWrapper
              key={ specType }
              spec={ specType === "foldChange" ? vis.foldChangeSpec : specType === "pValue" ? vis.pValueSpec : vis.spec }
              data={ vis.name === "voronoi" ? tree.descendants() : hierarchy }
              signals={[
                { name: "subtitle", value: subtitle },
                { name: "depth", value: depth },
                { name: "value", value: valueField },
                { name: "strokeField", value: strokeField },
                { name: "legendTitle", value: legendTitle },
                { name: "colorScheme", value: colorScale.scheme },
                { name: "reverseColors", value: colorScale.reverse },
                { name: "highlightColor", value: colorScale.highlight },
                { name: "inconclusiveColor", value: colorScale.inconclusive },
                { name: "domain", value: domain }
              ]}
              eventListeners={[
                { type: "click", callback: onSelectNode }
              ]}
              tooltip={ 
                <VegaTooltip>
                  <DetailVis 
                    subgroup={ subgroup } 
                    subgroupName={ subgroupName } />
                </VegaTooltip>
              }
            />
          </ResizeWrapper>
        }
      </>
    </>
  );
};           