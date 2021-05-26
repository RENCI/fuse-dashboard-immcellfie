import React, { useMemo } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import * as d3 from "d3";
import { VegaWrapper } from "../vega-wrapper";
import { histogram, densityComparison, bar, barComparison } from "../../vega-specs";
import "./detail-vis.css";

const { Subtitle, Body, Footer } = Card;

const formatNumber = d => isNaN(d) ? "Inconclusive" : d3.format(".2f")(d);
const formatPValue = d => d < 0.001 ? "0.001" : d3.format(".3f")(d);

const subgroupValues = (value, key) => {  
  return value ? value[key].filter(({ value }) => !isNaN(value)) : [];
};

const compareValues = (value, key) => {
  return value ? value[key + "1"].concat(value[key + "2"]).filter(({ value }) => !isNaN(value)) : [];
};

export const DetailVis = ({ data, subgroup, subgroupName, scoreDomain, onCloseClick }) => {
  const isComparison = subgroup === "comparison";

  const score = data && (isComparison ? data.scoreFoldChange : data["score" + subgroup]);
  const activity = data && (isComparison ? data.activityChange : data["activity" + subgroup]);  
  
  const scores = useMemo(() => {
    return isComparison ? compareValues(data, "scores", subgroupName) : subgroupValues(data, "scores" + subgroup);
  }, [data, subgroup, subgroupName, isComparison]);

  const activities = useMemo(() => {
    return isComparison ? compareValues(data, "activities", subgroupName) : subgroupValues(data, "activities" + subgroup);
  }, [data, subgroup, subgroupName, isComparison]);

  const scoreSpec = isComparison ? densityComparison : histogram;
  const activitySpec = isComparison ? barComparison : bar;

  const subtitle = isComparison ? subgroupName[0] + " vs. " + subgroupName[1] : subgroupName;

  return (
    <>
      { data &&
        <Card className="detailVis">
          <Body>
            <Row>
              <Col>
                <Subtitle>{ data.name }</Subtitle>
              </Col>
              { onCloseClick && 
                <Col xs="auto">
                  <Button                  
                    variant="link"
                    size="xs"
                    className="text-muted p-0 align-middle detailCloseButton"
                    onClick={ () => onCloseClick(data.name) }
                  >
                    <X />
                  </Button>
                </Col>
              }
            </Row>
            <div className="mt-1">{ subtitle }</div>
            <hr className="my-1"/>
            <div className="small">
              <div>
                { (isComparison ? "Score fold change: " : "Mean score: ") + formatNumber(score) }
                { isComparison && " (p-value: " + formatPValue(data.scorePValue) + ")"} 
              </div>
              <div>
                { (isComparison ? "Activity change: " : "Mean activity: ") + formatNumber(activity) }
                { isComparison && " (p-value: " + formatPValue(data.activityPValue) + ")" } 
              </div>
            </div>
            <hr className="my-1"/>
            { score || activity ? 
              <div className="text-center">            
                <small>Distributions</small>
                <div className="mb-2"></div>
                <VegaWrapper
                  spec={ scoreSpec }
                  data={ scores }
                  options={{ actions: false }}
                  signals={[
                    { name: "valueName", value: "score" },
                    { name: "valueDomain", value: scoreDomain }
                  ]}
                />
                <VegaWrapper
                  spec={ activitySpec }
                  data={ activities }
                  options={{ actions: false }}
                  signals={[
                    { name: "valueName", value: "activity" }
                  ]}
                />
              </div>
            : <div>No valid data</div> }
          </Body>
          { data.phenotype.length > 1 &&
            <Footer>
              <small>
                { data.phenotype.map((level, i) => (
                  <div key={ i } style={{ marginLeft: i + "em" }}>
                    { level }
                  </div>
                )) }
              </small>
            </Footer>
          }
        </Card>
      }
    </>
  );
};