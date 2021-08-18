import React, { useContext } from "react";
import { Col, Card, Form, Button } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import { ViewWrapper } from "../components/view-wrapper";
import { DataMissing } from "../components/data-missing";
import { HomeLink, CellfieLink } from "../components/page-links";
import { LoadExpression } from "../components/load-expression";
import { DataContext } from "../contexts";
import { useDownloadLink, useZipLink } from "../hooks";

const { Header, Body } = Card;
const { Row } = Form;

export const DownloadView = () => {
  const [{ rawPhenotypeData, rawExpressionData, rawOutput }] = useContext(DataContext);
  //const outputLink = useDownloadLink(rawOutput);
  const phenotypeLink = useDownloadLink(rawPhenotypeData);
  const inputLink = useDownloadLink(rawExpressionData);
  //const outputLink = useZipLink
  //const [zipLink, setZipLink] = useState(null);
  const outputLink = useZipLink([
    { data: rawOutput && rawOutput.taskInfo , fileName: "taskInfo.csv" },
    { data: rawOutput && rawOutput.score, fileName: "score.csv" },
    { data: rawOutput && rawOutput.scoreBinary, fileName: "score_binary.csv" }
  ]);
  const allLink = useZipLink([
    { data: rawPhenotypeData, fileName: "phenotypes.csv" },
    { data: rawExpressionData, fileName: "expression.csv" },
    { data: rawOutput && rawOutput.taskInfo , fileName: "taskInfo.csv" },
    { data: rawOutput && rawOutput.score, fileName: "score.csv" },
    { data: rawOutput && rawOutput.scoreBinary, fileName: "score_binary.csv" }
  ]);
/*
  useEffect(() => {
    if (!rawOutput) return null;

    const createZipLink = async () => {
      const zip = new JSZip();

      if (rawOutput) {
        zip.file("taskInfo.csv", rawOutput.taskInfo);
        zip.file("score.csv", rawOutput.score);
        zip.file("score_binary.csv", rawOutput.scoreBinary);
      }
  
      const blob = await zip.generateAsync({ type: "blob" });
  
      setOutputLink(URL.createObjectURL(blob));
    };

    createZipLink();
  }, [rawOutput]);

  useEffect(() => {
    if (!rawPhenotypeData && !rawOutput && !rawExpressionData) return null;

    const createZipLink = async () => {
      const zip = new JSZip();

      if (rawPhenotypeData) zip.file("phenotypes.csv", rawPhenotypeData);
      if (rawExpressionData) zip.file("expression.csv", rawExpressionData);
      if (rawOutput) {
        zip.file("taskInfo.csv", rawOutput.taskInfo);
        zip.file("score.csv", rawOutput.score);
        zip.file("score_binary.csv", rawOutput.scoreBinary);
      }
  
      const blob = await zip.generateAsync({ type: "blob" });
  
      setZipLink(URL.createObjectURL(blob));
    };

    createZipLink();
  }, [rawPhenotypeData, rawExpressionData, rawOutput]);
  */

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
            <div><small className="text-muted">{ alternateText }</small></div>
            { AlternateLink && <AlternateLink /> }
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
            <Row className="align-items-end">
              <Col className="text-center">{ download(phenotypeLink, "phenotypes.csv", "Phenotype data", HomeLink, "No phenotype data") }</Col>
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