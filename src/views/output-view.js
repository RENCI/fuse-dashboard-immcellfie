import React, { useContext } from "react";
import { Tabs, Tab } from "react-bootstrap";
import * as d3 from "d3";
import { DataContext } from "../contexts";
import { ModelSelection } from "../components/model-selection";
import { VegaWrapper } from "../components/vega-wrapper";
import { taskHeatmap } from "../vega-specs";
import { HierarchyVis } from "../components/hierarchy-vis";
import { PathwayVis } from "../components/pathway-vis";
import { DataMissing } from "../components/data-missing";

const practiceData = {
  output: "HPA.expected",
  outputType: "tsv",
  //output: "ASD.output",
  //output: "TD.output",
  //outputType: "csv"
};

export const OutputView = () => {
  const [{ phenotypes, output, groups }] = useContext(DataContext);

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
        name: "subject " + i,
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

    // Compute fold change
    if (groups) {
      const group0Score = d3.mean(d3.merge(node.data.allScores.filter((scores, i) => {
        return groups[i].number === 0;
      })));

      const group1Score = d3.mean(d3.merge(node.data.allScores.filter((scores, i) => {
        return groups[i].number === 1;
      })));

      node.data.scoreFoldChange = Math.pow(group0Score / group1Score, 2);
      node.data.activityFoldChange = 1;
    }
    else {
      node.data.scoreFoldChange = 1;
      node.data.activityFoldChange = 1;
    }

    node.data.subjects = d3.range(0, node.data.scores.length);
  });

  tree.eachBefore(node => {
    if (node.depth === 0) {
      node.data.phenotype = [];

      return;
    }

    node.data.phenotype = node.parent.data.phenotype.concat(node.data.name);  
  });

  return (
    <>
      { !phenotypes ? <DataMissing message="No data loaded" /> : 
        <ModelSelection 
          outputName={ practiceData.output } 
          outputType={ practiceData.outputType }
        /> 
      }
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
                  hasGroups={ groups !== null }
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
      : <DataMissing>No CellFIE output</DataMissing>
      }
    </>
  );  
};