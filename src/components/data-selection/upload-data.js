import { useState, useContext } from "react";
import { Modal, ListGroup, Row, Col, Figure, Alert } from "react-bootstrap";
import { UserContext, DataContext, ErrorContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { LoadNewButton } from "./load-new-button";
import { FileSelect } from "../file-select";
import { states } from "./states";
import { api } from "../../utils/api";

const { Header, Title, Body } = Modal;
const { Image } = Figure;

export const UploadData = ({ state, onSetState }) => {
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [show, setShow] = useState(false);
  const [phenotypeDataFile, setPhenotypeDataFile] = useState(null);
  const [expressionDataFile, setExpressionDataFile] = useState(null);

  const onPhenotypeFileSelect = file => {
    setPhenotypeDataFile(file);    
  };

  const onExpressionFileSelect = file => {
    setExpressionDataFile(file);
  };

  const onUploadDataClick = async () => {
    onSetState(states.uploading);

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {
      const expressionData = await api.loadFile(expressionDataFile);
      const phenotypeData = phenotypeDataFile ? await api.loadFile(phenotypeDataFile) : null;

      dataDispatch({ 
        type: "setDataInfo", 
        source: { name: "upload" },
        phenotypes: { name: phenotypeDataFile ? phenotypeDataFile.name : "Auto-generated" },
        expression: { name: expressionDataFile.name }
      });

      // Set phenotype data first
      if (phenotypeData) dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }

    onSetState(states.normal);
  };

  const dataImage = (label, description, src) => (
    <>
      <div>{ label }</div>
      { description.concat("e.g.").map((d, i) => <div key={ i } className="text-muted small">{ d }</div>) }
      <Image className="mt-1" src={ src } />
    </>
  );

  const disabled = state !== states.normal;

  const onShowClick = () => {
    setShow(true);
  };

  const onHideClick = () => {
    setShow(false);
  };

  return (
    <>
      <LoadNewButton 
        text='Upload files'
        onClick={ onShowClick }
      />

      <Modal show={ show } onHide={ onHideClick }>
        <Header closeButton>
          <Title>Upload files from your computer in CSV format</Title>
        </Header>
        <Body>
          <Alert variant='danger'>
            <Alert.Heading>Disclaimer</Alert.Heading>
            <ul>
              <li>Uploaded data will be publicly available to other ImmCellFIE users.</li>
              <li>Please ensure that no Protected Health Information (PHI) are uploaded. </li>
              <li>Also take care with uploading unpublished data.</li>
            </ul>
          </Alert>
          <ListGroup variant="flush">
            <ListGroup.Item>
              { dataImage("Expression data:", ["1st column: Entrez gene id", "Subsequent columns: samples"], "ExpressionDataFormat.png") }
              <FileSelect onChange={ onExpressionFileSelect } />
            </ListGroup.Item>
            <ListGroup.Item>
              { dataImage("Phenotype data (optional):", ["1st row: headers", "Subsequent rows: samples"], "PhenotypeDataFormat.png") }
              <FileSelect onChange={ onPhenotypeFileSelect } />
            </ListGroup.Item>
          </ListGroup>
          <hr />
          <SpinnerButton
            variant="primary"
            disabled={ disabled || !expressionDataFile }
            spin={ state === "uploading" }
            onClick={ onUploadDataClick }
          >
            Upload
          </SpinnerButton>  
        </Body>
      </Modal>
    </>
  );
/*  
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [phenotypeDataFile, setPhenotypeDataFile] = useState(null);
  const [expressionDataFile, setExpressionDataFile] = useState(null);

  const onPhenotypeFileSelect = file => {
    setPhenotypeDataFile(file);    
  };

  const onExpressionFileSelect = file => {
    setExpressionDataFile(file);
  };

  const onUploadDataClick = async () => {
    onSetState(states.uploading);

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {
      const expressionData = await api.loadFile(expressionDataFile);
      const phenotypeData = phenotypeDataFile ? await api.loadFile(phenotypeDataFile) : null;

      dataDispatch({ 
        type: "setDataInfo", 
        source: { name: "upload" },
        phenotypes: { name: phenotypeDataFile ? phenotypeDataFile.name : "Auto-generated" },
        expression: { name: expressionDataFile.name }
      });

      // Set phenotype data first
      if (phenotypeData) dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }

    onSetState(states.normal);
  };

  const dataImage = (label, description, src) => (
    <>
      <div>{ label }</div>
      { description.concat("e.g.").map((d, i) => <div key={ i } className="text-muted small">{ d }</div>) }
      <Image className="mt-1" src={ src } />
    </>
  );

  const disabled = state !== states.normal;

  return (
    <> 
      <h6>Upload files from your computer in CSV format</h6>
      <Alert variant='danger'>
        <Alert.Heading>Disclaimer</Alert.Heading>
        <ul>
          <li>Uploaded data will be publicly available to other ImmCellFIE users.</li>
          <li>Please ensure that no Protected Health Information (PHI) are uploaded. </li>
          <li>Also take care with uploading unpublished data.</li>
        </ul>
      </Alert>
      <Row>
        <Col>
          { dataImage("Expression data:", ["1st column: Entrez gene id", "Subsequent columns: samples"], "ExpressionDataFormat.png") }
          <FileSelect onChange={ onExpressionFileSelect } />
        </Col>
        <Col>
          { dataImage("Phenotype data (optional):", ["1st row: headers", "Subsequent rows: samples"], "PhenotypeDataFormat.png") }
          <FileSelect onChange={ onPhenotypeFileSelect } />
        </Col>
      </Row>
      <hr />
      <SpinnerButton
        variant="primary"
        disabled={ disabled || !expressionDataFile }
        spin={ state === "uploading" }
        onClick={ onUploadDataClick }
      >
        Upload
      </SpinnerButton>  
    </>
  );
*/  
};           