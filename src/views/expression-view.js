import { useContext, useState } from "react";
import { max, range } from "d3-array";
import { Card, Form, Row, Col } from "react-bootstrap";
import { UserContext, DataContext, ColorContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { ResizeWrapper } from "components/resize-wrapper";
import { VegaWrapper } from "components/vega-wrapper";
import { expressionHeatmap } from "vega-specs";
import { DataMissing } from "components/data-missing";
import { LoadExpression } from "components/load-expression";
import { UserLink, DataLink } from "components/page-links";

const { Header, Body } = Card;
const { Group, Label, Control } = Form;

export const ExpressionView = () => {
  const [{ user }] = useContext(UserContext);
  const [{ propertiesData, expressionData, groups }] = useContext(DataContext); 
  const [{ sequentialScales, sequentialScale }, colorDispatch] = useContext(ColorContext); 
  const [sortBy, setSortBy] = useState("median");

  const onSortByChange = evt => {
    setSortBy(evt.target.value);
  };

  const onColorMapChange = evt => {
    colorDispatch({ 
      type: "setColorScale", 
      scaleType: "sequential", 
      name: evt.target.value 
    });
  };

  // Transform to work with vega heatmap
  const heatmapData = !expressionData ? [] : expressionData.reduce((data, row) => {
    return data.concat(row.values.map((value, i) => {
      return {
        gene: row.gene,
        value: value,
        id: i,
        group: groups ? groups[i] : null
      };
    }));
  }, []);

  const numColumns = expressionData && expressionData.length > 0 ? expressionData[0].values.length : 0;

  const maxValue = max(heatmapData, d => d.value);

  const ticks = [0, ...range(1, 10).map(d => Math.pow(10, d))].filter(d => d < maxValue);
  ticks.pop();
  ticks.push(maxValue);

  return (
    <ViewWrapper>
      { !user ?
        <DataMissing message="No user selected" pageLink={ <UserLink /> } />
      : !propertiesData ? 
        <DataMissing message="No data loaded" pageLink={ <DataLink /> } />
      : !expressionData ? 
          <div className="text-center">
            <DataMissing message="No expression data loaded" /> 
            <LoadExpression />
          </div>
      : <Card>
          <Header as="h5">
            Expression Data
          </Header>
          <Body>        
            <Row className="mb-3">
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
                  value={ sequentialScale.scheme }
                  onChange={ onColorMapChange }          
                >
                  { sequentialScales.map(({ scheme, name }, i) => (
                    <option key={ i } value={ scheme }>{ name }</option>
                  ))}
                </Control>
              </Group>
            </Row>
            <ResizeWrapper>
              <VegaWrapper 
                spec={ expressionHeatmap } 
                data={ heatmapData } 
                signals={[
                  { name: "sortBy", value: sortBy },
                  { name: "colorScheme", value: sequentialScale.scheme },
                  { name: "ticks", value: ticks },
                  { name: "numColumns", value: numColumns }
                ]}
              />
            </ResizeWrapper>
          </Body>
        </Card>
      }
    </ViewWrapper>
  ); 
};