import React, { useContext, useState } from "react";
import * as d3 from "d3";
import { Card, Form, Col, Button } from "react-bootstrap";
import { DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { VegaWrapper } from "../components/vega-wrapper";
import { expressionHeatmap } from "../vega-specs";
import { DataMissing } from "../components/data-missing";
import { api } from "../api";
import { sequential } from "../colors";

const { Header, Body } = Card;
const { Group, Label, Control, Row } = Form;

const practiceData = {
  input: "HPA.tsv"
};

export const InputView = () => {
  const [{ phenotypeData, input, groups }, dataDispatch] = useContext(DataContext);  
  const [sortBy, setSortBy] = useState("median");
  const [color, setColor] = useState(sequential[0]);

  const onSortByChange = evt => {
    setSortBy(evt.target.value);
  };

  const onColorMapChange = evt => {
    setColor(sequential.find(({ scheme }) => scheme === evt.target.value));
  };

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
    <ViewWrapper>
      { !phenotypeData ? 
          <>
            <DataMissing message="No data loaded" showHome={ true } />
          </> 
      : !input ? 
          <div className="text-center">
            <DataMissing message="No expression data loaded" /> 
            <Button
              variant="outline-secondary"
              onClick={ onLoadDataClick }
            >
              Load expression data for current dataset
            </Button>
          </div>
      : <Card>
          <Header as="h5">
            Expression Data
          </Header>
          <Body>        
            <Row>
              <Group as={ Col } controlId="sortBySelect">
                <Label size="sm">Sort by</Label>
                <Control
                  size="sm"
                  as="select"
                  value={ sortBy }
                  onChange={ onSortByChange }          
                >                          
                  <option value="median">median</option>
                  <option value="mean">mean</option>
                  <option value="max">max</option>
                </Control>
              </Group>
              <Group as={ Col } controlId="colorMapSelect">
                <Label size="sm">Color map</Label>
                <Control
                  size="sm"
                  as="select"
                  value={ color.scheme }
                  onChange={ onColorMapChange }          
                >
                  { sequential.map(({ scheme, name }, i) => (
                    <option key={ i } value={ scheme }>{ name }</option>
                  ))}
                </Control>
              </Group>
            </Row>
            <div style={{ overflowX: "auto" }}>
              <VegaWrapper 
                spec={ expressionHeatmap } 
                data={ heatmapData } 
                signals={[
                  { name: "sortBy", value: sortBy },
                  { name: "colorScheme", value: color.scheme },
                  { name: "ticks", value: ticks }
                ]}
              />
            </div>
          </Body>
        </Card>
      }
    </ViewWrapper>
  ); 
};