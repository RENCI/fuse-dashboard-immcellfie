import React, { useContext, useState, useEffect } from "react";
import { Col, Card, Form, Button } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import * as JSZip from "jszip";
import { ViewWrapper } from "../components/view-wrapper";
import { DataMissing } from "../components/data-missing";
import { HomeLink, CellfieLink } from "../components/page-links";
import { LoadExpression } from "../components/load-expression";
import { DataContext } from "../contexts";
import { useDownloadLink } from "../hooks";

const { Header, Body } = Card;
const { Row } = Form;

export const DownloadView = () => {
  const [{ rawOutput, rawPhenotypeData, rawExpressionData }] = useContext(DataContext);
  const outputLink = useDownloadLink(rawOutput);
  const phenotypeLink = useDownloadLink(rawPhenotypeData);
  const inputLink = useDownloadLink(rawExpressionData, "text/tsv");
  const [zipLink, setZipLink] = useState(null);

  useEffect(() => {
    if (!rawPhenotypeData && !rawOutput && !rawExpressionData) return null;

    const createZipLink = async () => {
      const zip = new JSZip();
  
      if (rawOutput) zip.file("cellfie-output.csv", rawOutput);
      if (rawPhenotypeData) zip.file("phenotypes.csv", rawPhenotypeData);
      if (rawExpressionData) zip.file("expression-data.tsv", rawExpressionData);
  
      const blob = await zip.generateAsync({ type: "blob" });
  
      setZipLink(URL.createObjectURL(blob));
    };

    createZipLink();
  }, [rawPhenotypeData, rawOutput, rawExpressionData]);

  const download = (link, fileName, text, AlternateLink, alternateText) => {
    return (
      <div>
        { link ?
          <Button
            variant="outline-primary"
            href={ link }
            download={ fileName }
          >
            <Download className="mr-1" />
            { text }
          </Button>
        : 
          <>
            <div>{ alternateText }</div> 
            { AlternateLink && <div><AlternateLink /></div> }
          </>
        }
      </div>
    );
  };  

  return (   
    <ViewWrapper>
      { !rawPhenotypeData ? 
        <DataMissing message="No data loaded" showHome={ true } />      
      : 
        <Card>
          <Header as="h5">
            Download Data
          </Header>
          <Body>  
            <Row className="align-items-center">
              <Col className="text-center">{ download(outputLink, "cellfie-output.csv", "CellFIE output", CellfieLink, "No CellFIE output") }</Col>
              <Col className="text-center">{ download(phenotypeLink, "phenotypes.csv", "Phenotype data", HomeLink, "No phenotype data") }</Col>
              <Col className="text-center">{ download(inputLink, "expression-data.tsv", "Expression data", LoadExpression, "No expression data") }</Col>
              <Col className="text-center border-left">{ download(zipLink, "immcellfie-data.zip", "Zip file", null, "No data") }</Col>
            </Row>
          </Body>
        </Card>
      }
    </ViewWrapper>
  ); 
};