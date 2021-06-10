import React, { useContext, useState, useEffect } from "react";
import { Col, Card, Form, Button } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import * as JSZip from "jszip";
import { ViewWrapper } from "../components/view-wrapper";
import { DataMissing } from "../components/data-missing";
import { HomeLink, CellfieLink, ExpressionLink } from "../components/page-links";
import { DataContext } from "../contexts";
import { useDownloadLink } from "../hooks";

const { Header, Body } = Card;
const { Row } = Form;

export const DownloadView = () => {
  const [{ rawPhenotypeData, rawOutput, rawInput }] = useContext(DataContext);
  const phenotypeLink = useDownloadLink(rawPhenotypeData);
  const outputLink = useDownloadLink(rawOutput);
  const inputLink = useDownloadLink(rawInput, "text/tsv");
  const [zipLink, setZipLink] = useState(null);

  useEffect(() => {
    if (!rawPhenotypeData && !rawOutput && !rawInput) return null;

    const createZipLink = async () => {
      const zip = new JSZip();
  
      if (rawPhenotypeData) zip.file("phenotypes.csv", rawPhenotypeData);
      if (rawOutput) zip.file("cellfie-output.csv", rawOutput);
      if (rawInput) zip.file("expression-data.tsv", rawInput);
  
      const blob = await zip.generateAsync({ type: "blob" });
  
      setZipLink(URL.createObjectURL(blob));
    };

    createZipLink();
  }, [rawPhenotypeData, rawOutput, rawInput]);

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
              <Col className="text-center">{ download(phenotypeLink, "phenotypes.csv", "Phenotype data", HomeLink, "No phenotype data") }</Col>
              <Col className="text-center">{ download(outputLink, "cellfie-output.csv", "CellFIE output", CellfieLink, "No CellFIE output") }</Col>
              <Col className="text-center">{ download(inputLink, "expression-data.tsv", "Expression data", ExpressionLink, "No expression data") }</Col>
              <Col className="text-center border-left">{ download(zipLink, "immcellfie-data.zip", "Zip file", null, "No data") }</Col>
            </Row>
          </Body>
        </Card>
      }
    </ViewWrapper>
  ); 
};