import React, { useContext } from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import { UserContext, DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { DataMissing } from "../components/data-missing";
import { UserLink, CellfieLink, InputLink } from "../components/page-links";
import { LoadExpression } from "../components/load-expression";
import { useDownloadLink, useZipLink } from "../hooks";

const { Header, Body } = Card;

export const DownloadView = () => {
  const [{ email }] = useContext(UserContext);
  const [{ rawPhenotypeData, rawExpressionData, rawOutput }] = useContext(DataContext);
  const phenotypeLink = useDownloadLink(rawPhenotypeData);
  const inputLink = useDownloadLink(rawExpressionData);
  const outputLink = useZipLink([
    { data: rawOutput && rawOutput.taskInfo , fileName: "taskInfo.csv" },
    { data: rawOutput && rawOutput.score, fileName: "score.csv" },
    { data: rawOutput && rawOutput.scoreBinary, fileName: "score_binary.csv" },
    { data: rawOutput && rawOutput.detailScoring, fileName: "detailScoring.csv" }
  ]);
  const allLink = useZipLink([
    { data: rawPhenotypeData, fileName: "phenotypes.csv" },
    { data: rawExpressionData, fileName: "expression.csv" },
    { data: rawOutput && rawOutput.taskInfo , fileName: "taskInfo.csv" },
    { data: rawOutput && rawOutput.score, fileName: "score.csv" },
    { data: rawOutput && rawOutput.scoreBinary, fileName: "score_binary.csv" },
    { data: rawOutput && rawOutput.detailScoring, fileName: "detailScoring.csv" }
  ]);

  const download = (link, fileName, text, AlternateLink, alternateText) => {
    return (
      <div>
        { link ?
          <Button
            variant="outline-primary"
            href={ link }
            download={ fileName }
          >
            <Download className="me-1" />
            { text }
          </Button>
        : 
          <>
            <div><small className="text-muted">{ alternateText }</small></div>
            { AlternateLink && <AlternateLink /> }
          </>
        }
      </div>
    );
  };  

  return (   
    <ViewWrapper>
      { !email ?
        <DataMissing message="No user email selected" pageLink={ <UserLink /> } />
      : !rawPhenotypeData ? 
        <DataMissing message="No data loaded" pageLink={ <InputLink /> } />      
      : 
        <Card>
          <Header as="h5">
            Download Data
          </Header>
          <Body>  
            <Row className="align-items-end">
              <Col className="text-center">{ download(phenotypeLink, "phenotypes.csv", "Phenotype data", UserLink, "No phenotype data") }</Col>
              <Col className="text-center">{ download(inputLink, "expression.csv", "Expression data", LoadExpression, "No expression data") }</Col>
              <Col className="text-center">{ download(outputLink, "cellfie_output.zip", "CellFIE output (zipped)", CellfieLink, "No CellFIE output") }</Col>
            </Row>
            <hr />
            <Row>
              <Col className="text-center">{ download(allLink, "immcellfie_data.zip", "All (zipped)", null, "No data") }</Col>
            </Row>
          </Body>
        </Card>
      }
    </ViewWrapper>
  ); 
};