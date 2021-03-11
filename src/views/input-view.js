import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { expressionHeatmap } from "../vega-specs";

const { Body } = Card;

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  // Transform to work with vega-lite heatmap
  const heatmapData = !input ? [] : input.data.reduce((data, row) => {
    return data.concat(row.subjects.map((subject, i, a) => {
      return {
        gene: row.gene,
        ...subject,
        group: i < a.length / 2 ? "A" : "B"
      };
    }));
  }, []);

  return (
    <>
      { input ? 
        <>
          <h4>Input data</h4>
          <Card>
            <Body>
              <VegaWrapper 
                spec={ expressionHeatmap } 
                data={ heatmapData } 
              />
            </Body>
          </Card>
        </>
      : <h4>No input</h4>
      }
    </>
  ); 
};