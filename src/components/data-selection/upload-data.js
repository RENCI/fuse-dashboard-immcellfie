import { useState, useContext } from "react";
import { Modal, ListGroup, Figure, Alert, Form, Button } from "react-bootstrap";
import { UserContext, ErrorContext } from "contexts";
import { FileSelect } from "components/file-select";
import { BoldLabel } from "components/bold-label";
import { LoadNewButton } from "./load-new-button";

const { Header, Title, Body } = Modal;
const { Image } = Figure;
const { Group, Control } = Form;

const service = "fuse-provider-upload";

const checkFileSize = file => file.size <= process.env.REACT_APP_UPLOAD_MB_LIMIT * 1e6;

export const UploadData = () => {
  const [{ user }, userDispatch] = useContext(UserContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [show, setShow] = useState(false);
  const [expressionFile, setExpressionFile] = useState(null);
  const [propertiesFile, setPropertiesFile] = useState(null);
  const [description, setDescription] = useState("");

  const onShowClick = () => {
    setShow(true);
  };

  const onHideClick = () => {
    setShow(false);
  };

  const fileSizeError = () => 
    errorDispatch({ 
      type: "setError", 
      error: `File size limit is ${ process.env.REACT_APP_UPLOAD_MB_LIMIT } MB\nPlease select a different file`      
    });

  const onExpressionFileSelect = file => {
    if (checkFileSize(file)) {
      setExpressionFile(file);
    }
    else {
      fileSizeError();
    }
  };

  const onPropertiesFileSelect = file => {    
    if (checkFileSize(file)) {
      setPropertiesFile(file);
    }
    else {
      fileSizeError();
    }   
  };

  const onDescriptionChange = evt => {
    setDescription(evt.target.value);
  };

  const onUploadDataClick = async () => {
    const files = {};
    if (expressionFile) files.expressionFile = expressionFile;
    if (propertiesFile) files.propertiesFile = propertiesFile;

    userDispatch({ 
      type: "addDataset", 
      dataset: {
        service: service,
        type: "input",
        user: user,
        files: files,
        description: description
      }
    });

    setExpressionFile(null);
    setPropertiesFile(null);
    setDescription("");
    setShow(false);   
  };

  const dataImage = (label, description, src) => (
    <>
      <BoldLabel>{ label }</BoldLabel>
      { description.concat("e.g.").map((d, i) => <div key={ i } className="text-muted small">{ d }</div>) }
      <Image className="mt-1" src={ src } />
    </>
  );

  return (
    <>
      <LoadNewButton 
        text="Upload local files"
        onClick={ onShowClick }
      />

      <Modal show={ show } onHide={ onHideClick }>
        <Header closeButton>
          <Title>Upload files from your computer</Title>
        </Header>
        <Body>
          <Alert variant="danger">
            <Alert.Heading>Disclaimer</Alert.Heading>
            <ul>
              <li>Uploaded data will be publicly available to other ImmCellFIE users.</li>
              <li>Please ensure that no Protected Health Information (PHI) are uploaded. </li>
              <li>Also take care with uploading unpublished data.</li>
            </ul>
          </Alert>
          <>Files should be in CSV format</>
          <hr />
          <ListGroup variant="flush">
            <ListGroup.Item>
              { dataImage("Expression data (required)", ["1st row (optional—not shown below): header with sample names", "1st column: Entrez gene id", "Subsequent columns: expression values per sample"], "ExpressionDataFormat.png") }
              <FileSelect onChange={ onExpressionFileSelect } />
            </ListGroup.Item>
            <ListGroup.Item>
              { dataImage("Properties data (optional)", ["1st row: header with property names", "Subsequent rows: property values per sample", "Note: samples (rows) should be in same order as expression data samples (columns)"], "PropertiesDataFormat.png") }
              <FileSelect onChange={ onPropertiesFileSelect } />
            </ListGroup.Item>
            <ListGroup.Item>
              <Group controlId="description">
                <BoldLabel>Description (optional)</BoldLabel>
                <Control 
                  value={ description }
                  onChange={ onDescriptionChange }
                />
              </Group>
            </ListGroup.Item>
          </ListGroup>
          <hr />
          <div className="d-grid">
            <Button
              variant="primary"
              disabled={ !expressionFile }
              onClick={ onUploadDataClick }
            >
              Upload
            </Button>  
          </div>
        </Body>
      </Modal>
    </>
  );
};           