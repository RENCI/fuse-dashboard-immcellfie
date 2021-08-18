import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Alert, Row, Col } from "react-bootstrap";
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

const states = {
  normal: "normal",
  submitting: "submitting",
  uploading: "uploading",
  loading: "loading"
};

export const DataSelection = () => {
  const [{ dataInfo, phenotypeData, expressionData }, dataDispatch] = useContext(DataContext);
  const [id, setId] = useState("mock_obj1");
  const [state, setState] = useState(states.normal);
  const [errorMessage, setErrorMessage] = useState();
  const [phenotypeDataFile, setPhenotypeDataFile] = useState(null);
  const [expressionDataFile, setExpressionDataFile] = useState(null);

  const getErrorMessage = error => {
    if (error.response) {
      // Client received response
      console.log(error.response);

      return <>Request failed</>;
    } 
    else if (error.request) {
      // Client never received a response, or request never left
      console.log(error.request);

      return <>Request failed</>;
    } 
    else {
      // Anything else
      return <>Request failed</>;
    }
  };

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitClick();
    }
  };

  const onSubmitClick = async () => {
    setState(states.normal);
    setErrorMessage();

    dataDispatch({ type: "clearData" });

    try {
      const [phenotypeInfo, expressionInfo] = await api.getDataInfo(id);

      dataDispatch({ 
        type: "setDataInfo", 
        source: "immcellfie",
        phenotypeInfo: phenotypeInfo,
        expressionInfo: expressionInfo
      });

      const phenotypeData = await api.loadDataUrl(phenotypeInfo.url);

      dataDispatch({ type: "setPhenotypes", data: phenotypeData });
    }
    catch (error) {
      console.log(error);

      setErrorMessage(getErrorMessage(error));
    }

    setState(states.normal);
  };

  const onLoadPracticeClick = async () => {
    setState(states.loading);
    setErrorMessage();

    dataDispatch({ type: "clearData" });

    try {
      const data = await api.loadPracticeData(practiceData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: "practice" });
      dataDispatch({ type: "setPhenotypes", data: data });
    }
    catch (error) {
      console.log(error);

      setErrorMessage(getErrorMessage(error));
    }
  
    setState(states.normal);
  };

  const onPhenotypeFileSelect = file => {
    setPhenotypeDataFile(file);    
  };

  const onExpressionFileSelect = file => {
    setExpressionDataFile(file);
  };

  const onUploadDataClick = async () => {
    setState(states.uploading);
    setErrorMessage();

    try {
      const phenotypeData = await api.loadFile(phenotypeDataFile);
      const expressionData = await api.loadFile(expressionDataFile);

      dataDispatch({ 
        type: "setDataInfo", 
        source: "upload",
        phenotypeInfo: { name: phenotypeDataFile.name },
        expressionInfo: { name: expressionDataFile.name }
      });

      // XXX: Check number of subjects?

      dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData, file: expressionDataFile });
    }
    catch (error) {
      console.log(error);

      setErrorMessage(getErrorMessage(error));
    }

    setState(states.normal);
  };

  const orText = <em className="small">OR</em>;

  const disabled = state !== states.normal;

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <Row>
          <Col>    
            <h6>Load ImmuneSpace group ID</h6>
            <Group>  
              <InputGroup>
                <InputGroup.Prepend>
                  <SpinnerButton 
                    variant="primary"
                    disabled={ disabled || id === "" }
                    spin={ state === "submitting" }
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
              <SpinnerButton
                variant="outline-secondary"
                disabled={ disabled || !phenotypeDataFile || !expressionDataFile }
                spin={ state === "uploading" }
                block={ true }
                onClick={ onUploadDataClick }
              >
                Upload
              </SpinnerButton>              
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
              spin={ state === "loading" }
              block={ true }
              onClick={ onLoadPracticeClick }
            >
              Load
            </SpinnerButton>
          </Col>
        </Row>
        { (phenotypeData || expressionData) && 
          <>
            <hr />
            <Row className="row-eq-height">
              <Col>
                { phenotypeData && 
                  <PhenotypeInfo 
                    source={ dataInfo.source }
                    name={ dataInfo.phenotypeInfo.name } 
                    data={ phenotypeData } 
                  /> 
                }
              </Col>
              <Col>
                { expressionData && 
                  <ExpressionInfo 
                    source={ dataInfo.source }
                    name={ dataInfo.expressionInfo.name }
                    data={ expressionData } 
                  /> 
                }
              </Col>
            </Row>
          </>
        }
        { errorMessage && 
          <>
            <hr />
            <Alert variant="danger">{ errorMessage }</Alert> 
          </>
        }
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