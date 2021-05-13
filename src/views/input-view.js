import React, { useContext } from "react";
import * as d3 from "d3";
import { Card, Button } from "react-bootstrap";
import { DataContext } from "../contexts";
import { VegaWrapper } from "../components/vega-wrapper";
import { expressionHeatmap } from "../vega-specs";
import { DataMissing } from "../components/data-missing";
import { api } from "../api";

const { Header, Body } = Card;

const practiceData = {
  input: "HPA.tsv"
};

export const InputView = () => {
  const [{ phenotypeData, input, groups }, dataDispatch] = useContext(DataContext);

  // Transform to work with vega-lite heatmap
  const heatmapData = !input ? [] : input.data.reduce((data, row) => {
    return data.concat(row.values.map((value, i) => {
      return {
        gene: row.gene,
        value: value,
        id: i,
        group: groups ? groups[i] : null
      };
    }));
  }, []);

  const maxValue = d3.max(heatmapData, d => d.value);

  const ticks = [0, ...d3.range(1, 10).map(d => Math.pow(10, d))].filter(d => d < maxValue);
  ticks.push(maxValue);

  const onLoadDataClick = async () => {
    const data = await api.loadPracticeData(practiceData.input);

    dataDispatch({ type: "setInput", file: data });
  };

  return (
    <>
      { !phenotypeData ? 
          <>
            <DataMissing message="No data loaded" showHome={ true } />
          </> :
        !input ? 
          <>
            <DataMissing message="No expression data loaded" /> 
            <Button
              variant="outline-secondary"
              onClick={ onLoadDataClick }
            >
              Load expression data for current dataset
            </Button>
          </>:
        <Card>
          <Header as="h5">
            Expression Data
          </Header>
          <Body>
            <VegaWrapper 
              spec={ expressionHeatmap } 
              data={ heatmapData } 
              signals={[
                { name: "ticks", value: ticks }
              ]}
            />
          </Body>
        </Card>
      }
    </>
  ); 
};