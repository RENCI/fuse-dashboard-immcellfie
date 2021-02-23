import React, { useState, useRef, useEffect } from "react";
import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import { treemap, enclosure, voronoiTreemap } from "../../vega-specs";
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
  const [vis, setVis] = useState(visualizations[0]);
  const vegaRef = useRef();

  const onVisChange = evt => {
    const vis = visualizations.find(({ name }) => name === evt.target.value);

    setVis(vis);
  };

  useEffect(() => {
    console.log(vegaRef.current ? vegaRef.current.offsetWidth : "");
  }, []);

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
        <VegaWrapper
          spec={ vis.spec }
          data={ vis.spec === voronoiTreemap ? tree.descendants() : data }
        />
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