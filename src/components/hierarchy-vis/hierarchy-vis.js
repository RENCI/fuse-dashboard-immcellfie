import React, { useState } from "react";
import { Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { VegaWrapper } from "../vega-wrapper";
import { treemap, enclosure, voronoiTreemap } from "../../vega-specs";
import { LoadingSpinner } from "../loading-spinner";
import "./hierarchy-vis.css";

const { Group, Control, Label } = Form; 

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

  const onLoaded = () => {
    setLoading(false);
  };

  const onVisChange = evt => {
    const vis = visualizations.find(({ name }) => name === evt.target.value);

    setVis(vis);
  };

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
      <VegaWrapper
        spec={ vis.spec }
        data={ vis.spec === voronoiTreemap ? tree.descendants() : data }
      />
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