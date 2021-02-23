import React, { useState, useRef, useEffect } from "react";
import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import * as d3 from "d3";
import { voronoiTreemap as d3VoronoiTreemap } from "d3-voronoi-treemap";
import { VegaWrapper } from "../vega-wrapper";
import { treemap, enclosure, voronoiTreemap } from "../../vega-specs";
import { LoadingSpinner } from "../loading-spinner";
import "./hierarchy-vis.css";

const { Group } = Form; 

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
        const prng = d3.randomUniform.source(d3.randomLcg(0))();

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
      <Group>
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
      <div ref={vegaRef }>
        { loading ? <LoadingSpinner /> : 
          <VegaWrapper
            spec={ vis.spec }
            data={ vis.spec === voronoiTreemap ? tree.descendants() : data }
          />
        }
      </div>
    </>
  );
};

/*
<Tab 
              eventKey="treemap" 
              title="Treemap"
            >
              <div className="mt-3">
                <VegaWrapper 
                  className="mt-3"
                  spec={ treemap } 
                  data={ hierarchyData } 
                />
              </div>  
            </Tab>
            <Tab 
              eventKey="enclosure" 
              title="Enclosure diagram"
            >
              <div className="mt-3">
                <VegaWrapper 
                  className="mt-3"
                  spec={ enclosure } 
                  data={ hierarchyData } 
                />
              </div>  
            </Tab>
            <Tab 
              eventKey="voronoi" 
              title="Voronoi treemap"
            >
              <div className="mt-3">
                <VegaWrapper 
                  className="mt-3"
                  spec={ voronoiTreemap } 
                  data={ tree.descendants() } 
                />
              </div>  
            </Tab>
*/            