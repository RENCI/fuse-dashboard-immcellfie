import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import * as d3 from "d3";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { taskHeatmap, treemap } from "../vega-specs";

export const OutputView = () => {
  const [data] = useContext(DataContext);

  const { output } = data;

  // Transform to work with vega-lite heatmap
  const heatmapData = !output ? [] : output.tasks.reduce((data, task) => {
    return data.concat(task.scores.map((score, i) => {
      return {
        task: task.phenotype[0],
        gene: i,
        score: score,
        activity: task.activities[i]
      };
    }));
  }, []);

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
        name: id,
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

  // Stratify to and aggregate scores and activities
  const tree = d3.stratify()
      .id(d => d.name)
      .parentId(d => d.parent)
      (hierarchyData);

  tree.eachAfter(node => {
    if (!node.children) return;
    
    node.data.scores = d3.merge(node.children.map(child => {
      return child.data.scores ? child.data.scores : [child.data.score];
    }));

    node.data.score = d3.median(node.data.scores);

    node.data.activities = d3.merge(node.children.map(child => {
      return child.data.activities ? child.data.activities : [child.data.activity];
    }));

    node.data.activity = d3.median(node.data.activities);
  });

  return (
    <>
      { output ? 
        <>
          <h4>Cellfie output</h4>
          <Card className="mt-3">
            <Card.Body>
              <VegaWrapper 
                spec={ treemap } 
                data={ hierarchyData } 
              />
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <VegaWrapper 
                spec={ taskHeatmap } 
                data={ heatmapData } 
              />
            </Card.Body>
          </Card>
        </>
      : <h4>No output</h4>
      }
    </>
  );  
};