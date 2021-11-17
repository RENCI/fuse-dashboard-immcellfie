import React, { useState, useContext, useEffect } from "react";
import { Card, Form, InputGroup, Alert, Row, Col, OverlayTrigger, Popover, Button } from "react-bootstrap";
import { BoxArrowUpRight, QuestionCircle, PersonFill } from "react-bootstrap-icons";
import { UserContext, DataContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { FileSelect } from "../file-select";
import { PhenotypeInfo } from "../phenotype-info";
import { ExpressionInfo } from "../expression-info";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { api } from "../../utils/api";
import { practiceData } from "../../utils/datasets";

const { Header, Body, Footer } = Card;
const { Group, Control, Label } = Form;

const states = {
  normal: "normal",
  submitting: "submitting",
  uploading: "uploading",
  loading: "loading"
};

export const DataSelection = () => {  
  const [{ email, apiKey }, userDispatch] = useContext(UserContext);
  const [
    { dataInfo, phenotypeData, expressionData, numPhenotypeSubjects, numExpressionSubjects }, 
    dataDispatch
  ] = useContext(DataContext);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [groupId, setGroupId] = useState("");
  const [state, setState] = useState(states.normal);
  const [errorMessage, setErrorMessage] = useState();
  const [phenotypeDataFile, setPhenotypeDataFile] = useState(null);
  const [expressionDataFile, setExpressionDataFile] = useState(null);

  useEffect(() => {
    if (dataInfo && dataInfo.source === "upload" && numPhenotypeSubjects !== numExpressionSubjects) {
      setErrorMessage(`Number of subjects in phenotype data (${ numPhenotypeSubjects }) does not match number of subjets in expression data (${ numExpressionSubjects }). Please upload data with matching subject numbers.`);
    }
    else {
      setErrorMessage();
    }
  }, [dataInfo, numPhenotypeSubjects, numExpressionSubjects])

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

  const onApiKeyChange = evt => {
    setInputApiKey(evt.target.value);
  };

  const onApiKeyKeyPress = evt => {
    if (evt.key === "Enter") {
      onEnterApiKeyClick();
    }
  };

  const onGroupIdChange = evt => {
    setGroupId(evt.target.value);
  };

  const onGroupIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitGroupIdClick();
    }
  };

  const onEnterApiKeyClick = async () => {
    userDispatch({ type: "setApiKey", apiKey: inputApiKey });
  };

  const onSubmitGroupIdClick = async () => {
    setState(states.submitting);
    setErrorMessage();

    dataDispatch({ type: "clearData" });

    try {
      const downloadId = await api.getImmuneSpaceDownloadId(email, groupId, apiKey);

      const timer = setInterval(checkStatus, 1000);

      async function checkStatus() {
        const status = await api.checkImmunspaceDownloadStatus(downloadId);

        if (status === "finished") {
          clearInterval(timer);

          const phenotypeData = await api.getImmuneSpacePhenotypes(downloadId);

          dataDispatch({ 
            type: "setDataInfo", 
            source: "ImmuneSpace",
            downloadId: downloadId,
            phenotypeInfo: { name: groupId }
          });
    
          dataDispatch({ type: "setPhenotypes", data: phenotypeData });

          setState("normal");
        }
        else if (status === "failed") {
          clearInterval(timer);
          setState("normal");
        }
      };
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
      const expressionData = await api.loadPracticeData(practiceData.expressionData);
      const phenotypeData = await api.loadPracticeData(practiceData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: "practice" });

      // Set phenotype data first
      dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
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
      const expressionData = await api.loadFile(expressionDataFile);
      const phenotypeData = phenotypeDataFile ? await api.loadFile(phenotypeDataFile) : null;

      dataDispatch({ 
        type: "setDataInfo", 
        source: "upload",
        phenotypeInfo: { name: phenotypeDataFile ? phenotypeDataFile.name : "Auto-generated" },
        expressionInfo: { name: expressionDataFile.name }
      });

      // Set phenotype data first
      if (phenotypeData) dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
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
            <h6>
              ImmuneSpace 
              <a 
                href="https://www.immunespace.org/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <BoxArrowUpRight className="ml-1 mb-1" />
              </a>
            </h6>
            <Group>
              <Label>
                API key 
                <OverlayTrigger
                  placement="right"
                  overlay={ 
                    <Popover style={{ maxWidth: 500 }}>
                      <Popover.Title>An <b>API key</b> is necessary to access data from <b>ImmuneSpace</b></Popover.Title>
                      <Popover.Content>                        
                        <div>
                        In ImmuneSpace:
                        <ol>
                          <li><b><PersonFill className="mb-1" /></b> menu.</li>
                          <li><b>External Tool Access</b></li>
                          <li><b>Generate API Key</b>, <b>Copy to Clipboard</b>, and paste here.</li>
                        </ol>
                        </div>
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <QuestionCircle className="ml-1 mb-1" />
                </OverlayTrigger>
              </Label>
              <InputGroup>
                <Control 
                  type="text"
                  value={ inputApiKey }
                  onChange={ onApiKeyChange } 
                  onKeyPress={ onApiKeyKeyPress }
                />
                <InputGroup.Append>
                  <Button 
                    variant="primary"
                    disabled={ disabled || inputApiKey === "" || inputApiKey === apiKey }
                    onClick={ onEnterApiKeyClick }
                  >
                    Enter
                  </Button>
                </InputGroup.Append>
              </InputGroup>
              <Form.Text className="text-muted">
                { apiKey ? <>Current: { apiKey }</> : <>No current API key</> } 
              </Form.Text>
            </Group>  
            <Group>
              <Label>
                Group Label
                <OverlayTrigger
                  placement="right"
                  overlay={ 
                    <Popover style={{ maxWidth: 500 }}>
                      <Popover.Title>A <b>Group Label</b> is used to identify data from <b>ImmuneSpace</b></Popover.Title>
                      <Popover.Content>
                        In Immunespace:
                        <ol>
                          <li>Create a group (e.g. by applying a filter)</li>
                          <li><b>Manage Groups</b></li>
                          <li><b>Save As</b></li>
                          <li>Enter a <b>Participant Group Label</b></li>
                          <li><b>Save</b></li>
                          <li>Copy and paste the group label here</li>
                        </ol>
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <QuestionCircle className="ml-1 mb-1" />
                </OverlayTrigger>
              </Label>
              <InputGroup>
                <Control 
                  type="text"
                  value={ groupId }
                  onChange={ onGroupIdChange } 
                  onKeyPress={ onGroupIdKeyPress }
                />
                <InputGroup.Append>
                  <SpinnerButton 
                    variant="primary"
                    disabled={ disabled || apiKey === "" || groupId === "" }
                    spin={ state === "submitting" }
                    onClick={ onSubmitGroupIdClick }
                  >
                    Submit
                  </SpinnerButton>
                </InputGroup.Append>
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
                defaultLabel="Required: select expression data"
                onChange={ onExpressionFileSelect }
              />
            </Group> 
            <Group>
              <FileSelect
                defaultLabel="Optional: select phenotype data"
                onChange={ onPhenotypeFileSelect }
              />
            </Group> 
            <Group>
              <SpinnerButton
                variant="outline-secondary"
                disabled={ disabled || !expressionDataFile }
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
                { 
                  <ExpressionInfo 
                    source={ dataInfo.source }
                    name={ dataInfo.expressionInfo.name }
                    data={ expressionData } 
                  /> 
                }
              </Col>
              <Col>
                { phenotypeData && 
                  <PhenotypeInfo 
                    source={ dataInfo.source }
                    name={ dataInfo.phenotypeInfo.name } 
                    data={ phenotypeData } 
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