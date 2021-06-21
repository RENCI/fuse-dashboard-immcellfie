import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Alert, Row, Col, Button } from "react-bootstrap";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { FileSelect } from "../file-select";
import { PhenotypeInfo } from "../phenotype-info";
import { ExpressionInfo } from "../expression-info";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body, Footer } = Card;
const { Label, Group, Control, Text } = Form;

export const DataSelection = () => {
  const [{ phenotypeData, input }, dataDispatch] = useContext(DataContext);
  const [id, setId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [phenotypeDataFile, setPhenotypeDataFile] = useState(null);
  const [expressionDataFile, setExpressionDataFile] = useState(null);

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitClick();
    }
  };

  const onSubmitClick = () => {
    setSubmitting(true);
    setMessage();

    dataDispatch({ type: "clearData" });

    setTimeout(() => {
      setSubmitting(false);
      setMessage(<>Submitting ID <strong>{ id }</strong> failed</>);
    }, 1000);
  };

  const onLoadPracticeClick = async () => {
    setLoading(true);
    setMessage();

    dataDispatch({ type: "clearData" });

    const data = await api.loadPracticeData(practiceData.phenotypes);

    dataDispatch({ type: "setPhenotypes", source: "practice", name: "phenotype data", data: data });

    setLoading(false);
  };

  const onPhenotypeFileSelect = file => {
    setPhenotypeDataFile(file);    
  };

  const onExpressionFileSelect = file => {
    setExpressionDataFile(file);
  };

  const onUploadDataClick = async () => {
    setLoading(true);
    setMessage();

    dataDispatch({ type: "clearData" });

    const phenotypeData = await api.loadFile(phenotypeDataFile);
    const expressionData = await api.loadFile(expressionDataFile);

    // XXX: Check number of subjects?

    dataDispatch({ type: "setPhenotypes", source: "upload", name: phenotypeDataFile.name, data: phenotypeData });
    dataDispatch({ type: "setInput", source: "upload", name: expressionDataFile.name, data: expressionData });

    setLoading(false);
  };

  const disabled = loading || submitting;

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <Group>        
          <Label>
            Load ImmuneSpace dataset ID
          </Label>
          <InputGroup>
            <InputGroup.Prepend>
              <SpinnerButton 
                variant="primary"
                disabled={ disabled || id === "" }
                spin={ submitting }
                onClick={ onSubmitClick }>
                Submit
              </SpinnerButton>
            </InputGroup.Prepend>
            <Control 
              type="text"
              value={ id }
              onChange={ onIdChange } 
              onKeyPress={ onIdKeyPress }
            />
          </InputGroup>
        </Group>
        <Group>
          <Text>OR</Text>
        </Group>
        <Group>   
          <FileSelect
            defaultLabel="Select phenotype data"
            onChange={ onPhenotypeFileSelect }
          />
        </Group>
        <Group>   
          <FileSelect
            defaultLabel="Select expression data"
            onChange={ onExpressionFileSelect }
          />
        </Group>
        <Group>
          <Button
            variant="outline-secondary"
            disabled={ !phenotypeDataFile || !expressionDataFile }
            onClick={ onUploadDataClick }
          >
            Upload data
          </Button>
        </Group>
        <Group>
          <Text>OR</Text>
        </Group>
        <Group>   
          <SpinnerButton 
            variant="outline-secondary"
            disabled={ disabled }
            spin={ loading }
            onClick={ onLoadPracticeClick }
          >
            Load practice data
          </SpinnerButton>
        </Group>
        <Row className="row-eq-height">
          <Col>
            { phenotypeData && <PhenotypeInfo phenotypeData={ phenotypeData } /> }
          </Col>
          <Col>
            { input && <ExpressionInfo expressionData={ input } /> }
          </Col>
        </Row>
        { message && <Alert variant="info">{ message }</Alert> }
      </Body>
      { phenotypeData &&
        <Footer>
          <Row>
            <Col className="text-center">
              <CellfieLink />
            </Col>
            <Col className="text-center">
              <SubgroupsLink />
            </Col>
            <Col className="text-center">
              <ExpressionLink />
            </Col>
          </Row>
        </Footer>
      }
    </Card>
  );
};           