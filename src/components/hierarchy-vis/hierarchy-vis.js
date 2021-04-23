import React, { useState, useRef, useEffect } from "react";
import { Form, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import * as d3 from "d3";
import { voronoiTreemap as d3VoronoiTreemap } from "d3-voronoi-treemap";
import { VegaWrapper } from "../vega-wrapper";
import { VegaTooltip } from "../vega-tooltip";
import { treemap, enclosure, voronoiTreemap } from "../../vega-specs";
import { LoadingSpinner } from "../loading-spinner";
import "./hierarchy-vis.css";

const { Group, Label, Control, Row } = Form; 

const visualizations = [
  {
    name: "treemap",
    label: "Treemap",
    spec: treemap
  },
  {
    name: "enclosure",
    label: "Enclosure diagram",
    spec: enclosure
  },
  {
    name: "voronoi",
    label: "Voronoi treemap",
    spec: voronoiTreemap
  }
];

const valueColorMaps = [
  "lightgreyred",
  "yellowgreenblue"
];

const changeColorMaps = [
  "blueorange"
];

export const HierarchyVis = ({ hierarchy, tree, hasGroups }) => {
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(1);
  const [value, setValue] = useState("score");
  const [scaleType, setScaleType] = useState("linearScale");
  const [colorMaps, setColorMaps] = useState(valueColorMaps);
  const [colorMap, setColorMap] = useState(colorMaps[0]);
  const [vis, setVis] = useState(visualizations[0]);
  const vegaRef = useRef();

  const onVisChange = evt => {
    setLoading(true);

    const vis = visualizations.find(({ name }) => name === evt.target.value);

    setVis(vis);
  };

  const onValueChange = evt => {
    const value = evt.target.value;

    const isChange = value.includes("Change");

    const colorMaps = isChange ? changeColorMaps : valueColorMaps;

    setValue(value);
    setScaleType(isChange ? "logScale" : "linearScale");
    setColorMaps(colorMaps);

    if (!colorMaps.includes(colorMap)) setColorMap(colorMaps[0]);
  };

  useEffect(() => {
    if (vis.name === "voronoi" && !tree.descendants()[0].polygon) {
      // Create Voronoi diagram, use setTimout so loading state can update
      setTimeout(() => {
        const width = vegaRef.current.clientWidth * 0.8;
        const prng = d3.randomUniform.source(d3.randomLcg(0.2))();

        const n = 64;
        const clip = d3.range(0, n).map(d => {
          return [
            Math.cos(d / n * Math.PI * 2) * width / 2 + width / 2, 
            Math.sin(d / n * Math.PI * 2) * width / 2 + width / 2
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

        tree.each(d => {
          d.path = d3.line()(d.polygon) + "z";
        });

        setLoading(false);
      }, 10);      
    }
    else {
      setLoading(false);
    }
  }, [vis, tree]);

  const logRange = values => {
    const extent = d3.extent(values);

    const max = Math.max(1 / extent[0], extent[1]);

    return [1 / max, max];
  };

  const domain = value === "activity" ? [0, 1] :
    value.includes("Change") ? logRange(tree.descendants().filter(d => d.depth === depth).map(d => d.data[value])) :
    d3.extent(tree.descendants().filter(d => d.depth === depth), d => d.data[value]);

  return (
    <>
      <div className="mb-4">
        <Row>
          <Group as={ Col } controlId="visualizationButtons">
            <ToggleButtonGroup 
              type="radio"
              name="visButtons"
              value={ vis.name }
            >
              { visualizations.map(({ name, label }, i) => (
                <ToggleButton 
                  key={ i }
                  type="radio"
                  variant="outline-primary"
                  value={ name }
                  onChange={ onVisChange }
                >
                  { label }
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Group>
        </Row>
        <Row>
          <Group as={ Col } controlId="depthSlider">
            <Label size="sm">Depth: { depth }</Label>        
            <Control 
              size="sm"
              className="my-1"
              type="range"
              min={ 1 }
              max={ 4 }         
              value={ depth }
              onChange={ evt => setDepth(+evt.target.value) } 
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
              <option disabled={ !hasGroups } value="scoreFoldChange">score fold change</option>
              <option disabled={ !hasGroups } value="activityFoldChange">activity fold change</option>
            </Control>
          </Group>
          <Group as={ Col } controlId="colorSchemeSelect">
            <Label size="sm">Color scheme</Label>
            <Control
              size="sm"
              as="select"
              value={ colorMap }
              onChange={ evt => setColorMap(evt.target.value) }          
            >
              { colorMaps.map((colorMap, i) => (
                <option key={ i }>{ colorMap }</option>
              ))}
            </Control>
          </Group>
        </Row>
      </div>
      <div ref={vegaRef }>
        { loading ? <LoadingSpinner /> : 
          <VegaWrapper
            spec={ vis.spec }
            data={ vis.spec === voronoiTreemap ? tree.descendants() : hierarchy }
            signals={[
              { name: "depth", value: depth },
              { name: "value", value: value },
              { name: "scaleType", value: scaleType },
              { name: "colorScheme", value: colorMap },
              { name: "domain", value: domain }
            ]}
            tooltip={ <VegaTooltip /> }
          />
        }
      </div>
    </>
  );
};           