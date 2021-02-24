import React, { useState, useRef, useEffect } from "react";
import { Form, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import * as d3 from "d3";
import { voronoiTreemap as d3VoronoiTreemap } from "d3-voronoi-treemap";
import { VegaWrapper } from "../vega-wrapper";
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

export const HierarchyVis = ({ data, tree }) => {
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(1);
  const [value, setValue] = useState("score");
  const [vis, setVis] = useState(visualizations[0]);
  const vegaRef = useRef();

  const onVisChange = evt => {
    setLoading(true);

    const vis = visualizations.find(({ name }) => name === evt.target.value);

    setVis(vis);
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

        console.log(tree.descendants());

        setLoading(false);
      }, 10);      
    }
    else {
      setLoading(false);
    }
  }, [vis, tree]);

  return (
    <>
      <Form className="mb-4">
        <Row>
          <Group as={ Col }>
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
          <Group as={ Col }>
            <Label size="sm">Value</Label>
            <Control
              size="sm"
              as="select"
              value={ value }
              onChange={ evt => setValue(evt.target.value) }          
            >
              <option>score</option>
              <option>activity</option>
            </Control>
          </Group>
          <Group as={ Col }>
            <Label size="sm">Depth: { depth }</Label>        
            <Control 
              size="sm"
              className="mt-1"
              type="range"
              min={ 1 }
              max={ 4 }         
              value={ depth }
              onChange={ evt => setDepth(evt.target.value) } 
            />
          </Group>
        </Row>
      </Form>
      <div ref={vegaRef }>
        { loading ? <LoadingSpinner /> : 
          <VegaWrapper
            spec={ vis.spec }
            data={ vis.spec === voronoiTreemap ? tree.descendants() : data }
            signals={[
              { name: "value", value: value },
              { name: "depth", value: depth }
            ]}
          />
        }
      </div>
    </>
  );
};           