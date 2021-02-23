import React, { useContext } from "react";
import { Tabs, Tab } from "react-bootstrap";
import * as d3 from "d3";
import { voronoiTreemap as d3VoronoiTreemap } from "d3-voronoi-treemap";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { taskHeatmap } from "../vega-specs";
import { HierarchyVis } from "../components/hierarchy-vis";
import { PathwayVis } from "../components/pathway-vis";

export const OutputView = () => {
  const [data] = useContext(DataContext);

  const { output } = data;

  // Create hierarchy
  const hierarchyData = !output ? [] : Object.values(output.tasks.reduce((data, task) => {
    // Add nodes for phenotype
    task.phenotype.forEach((name, i, a) => { 
      const top = i === a.length - 1;

      data[name] = {
        name: name,
        parent: top ? "root" : a[i + 1],
      };

      // Remove "METABOLISM" from top-level for shorter labels
      if (top) {
        data[name].label = name.replace(" METABOLISM", "");
      }
    });

    // Add nodes for scores
    task.scores.forEach((score, i) => {
      const parent = task.phenotype[0];
      const id = parent + "_" + i;

      data[id] = {
        name: "patient " + i,
        parent: parent,
        score: score,
        activity: task.activities[i]
      };
    });

    return data;
  }, {}));

  hierarchyData.push({
    name: "root",
    parent: null
  });

  // Stratify to aggregate scores and activities
  const tree = d3.stratify()
      .id(d => d.name)
      .parentId(d => d.parent)
      (hierarchyData);

  tree.eachAfter(node => {
    if (!node.children) return;

    node.children.forEach(child => {
      if (child.data.allScores) {
        if (!node.data.allScores) {
          node.data.allScores = [...child.data.allScores];
          node.data.allActivities = [...child.data.allActivities];
        }
        else {
          child.data.allScores.forEach((scores, i) => {
            node.data.allScores[i] = node.data.allScores[i].concat(scores);
          });

          child.data.allActivities.forEach((activities, i) => {
            node.data.allActivities[i] = node.data.allActivities[i].concat(activities);
          });
        }
      }
      else {
        if (!node.data.allScores) {
          node.data.allScores = [];
          node.data.allActivities = [];
        }

        node.data.allScores.push([child.data.score]);
        node.data.allActivities.push([child.data.activity]);
      }
    });

    node.data.scores = node.data.allScores.map(d => d3.mean(d));
    node.data.score = d3.mean(d3.merge(node.data.allScores));

    node.data.activities = node.data.allActivities.map(d => d3.mean(d));
    node.data.activity = d3.mean(d3.merge(node.data.allActivities));

    node.data.patients = d3.range(0, node.data.scores.length);
  });

  const format = d3.format('.2f');

  tree.eachBefore(node => {
    if (node.depth === 0) {
      node.data.phenotype = [];

      return;
    }

    node.data.phenotype = node.parent.data.phenotype.concat(node.data.name);

    node.data.tooltip = {
      title: node.data.name,
      score: format(node.data.score),
      activity: format(node.data.activity)
    };    

    if (node.depth > 1) {
      node.data.tooltip.phenotype = node.parent.data.phenotype.join(" → ");
    }
  });

  // Voronoi
  const width = 980;
  const height = 980;
  const prng = d3.randomUniform.source(d3.randomLcg(0))();

  tree
    .count()
    .sort((a, b) => b.height - a.height || b.data.score - a.data.score);

  const voronoi = d3VoronoiTreemap()
    .clip([
      [0, 0],
      [0, height],
      [width, height],
      [width, 0],
    ])
    .prng(prng)
    .maxIterationCount(5);

  voronoi(tree);

  tree.each(d => {
    d.path = d3.line()(d.polygon) + "z";
  });

  console.log(tree.descendants());

  return (
    <>
      { output ? 
        <>
          <h4>Cellfie output</h4>
          <Tabs
            mountOnEnter={ true }
            unmountOnExit={ true }
          >
            <Tab
              eventKey="hierarchy"
              title="Hierarchy"
            >
              <div className="mt-3">
                <HierarchyVis
                  data={ hierarchyData }
                  tree={ tree } 
                />
              </div>
            </Tab>
            <Tab 
              eventKey="heatmap" 
              title="Heatmap"
            >
              <div className="mt-3">
                <VegaWrapper 
                  spec={ taskHeatmap } 
                  data={ tree.descendants() } 
                />
              </div>
            </Tab>
            <Tab 
              eventKey="escher" 
              title="Pathway map "
            >
              <div className="mt-3">
                <PathwayVis />
              </div>
            </Tab>
          </Tabs>          
        </>
      : <h4>No output</h4>
      }
    </>
  );  
};