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
const { Group, Control } = Form;

export const DataSelection = () => {
  const [{ dataInfo, phenotypeData, expressionData }, dataDispatch] = useContext(DataContext);
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

    dataDispatch({ 
      type: "setDataInfo", 
      source: "practice"
    });

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

    const phenotypeData = await api.loadFile(phenotypeDataFile);
    const expressionData = await api.loadFile(expressionDataFile);

    dataDispatch({ 
      type: "setDataInfo", 
      source: "upload",
      phenotypeName: phenotypeDataFile.name,
      expressionName: expressionDataFile.name
    });

    // XXX: Check number of subjects?

    dataDispatch({ type: "setPhenotypes", data: phenotypeData });
    dataDispatch({ type: "setExpressionData", data: expressionData });

    setLoading(false);
  };

  const orText = <em className="small">OR</em>

  const disabled = loading || submitting;

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <Row>
          <Col>    
            <h6>Load ImmuneSpace dataset ID</h6>
            <Group>  
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
          </Col>
          <Col sm="auto">
            { orText }
          </Col>
          <Col> 
            <h6>Upload data</h6>
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
                block
                onClick={ onUploadDataClick }
              >
                Upload
              </Button>              
            </Group>
          </Col>
          <Col sm="auto">
            { orText }
          </Col>
          <Col>   
            <h6>Load practice data</h6>
            <SpinnerButton 
              variant="outline-secondary"
              disabled={ disabled }
              spin={ loading }
              block={ true }
              onClick={ onLoadPracticeClick }
            >
              Load
            </SpinnerButton>
          </Col>
        </Row>
        { phenotypeData && <hr /> }
        <Row className="row-eq-height">
          <Col>
            { phenotypeData && 
              <PhenotypeInfo 
                source={ dataInfo.source }
                name={ dataInfo.phenotypeName } 
                data={ phenotypeData } 
              /> 
            }
          </Col>
          <Col>
            { expressionData && 
              <ExpressionInfo 
                source={ dataInfo.source }
                name={ dataInfo.expressionName } 
                data={ expressionData } 
              /> 
            }
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