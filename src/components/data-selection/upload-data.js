import { useState, useContext } from "react";
import { Modal, ListGroup, Figure, Alert, Form } from "react-bootstrap";
import { UserContext } from "contexts";
import { SpinnerButton } from "components/spinner-button";
import { LoadNewButton } from "./load-new-button";
import { FileSelect } from "components/file-select";

const { Header, Title, Body } = Modal;
const { Image } = Figure;
const { Control } = Form;

const provider = "fuse-provider-upload";

export const UploadData = () => {
  const [{ user }, userDispatch] = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [expressionFile, setExpressionFile] = useState(null);
  const [propertiesFile, setPropertiesFile] = useState(null);
  const [description, setDescription] = useState("");

  const onPropertiesFileSelect = file => {
    setPropertiesFile(file);    
  };

  const onExpressionFileSelect = file => {
    setExpressionFile(file);
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
        provider: provider,
        user,
        files: files,
        description,
        createdTime: new Date()
      }
    });

    setExpressionFile(null);
    setPropertiesFile(null);
    setDescription("");
    setShow(false);   
  };

  const dataImage = (label, description, src) => (
    <>
      <h6>{ label }</h6>
      { description.concat("e.g.").map((d, i) => <div key={ i } className="text-muted small">{ d }</div>) }
      <Image className="mt-1" src={ src } />
    </>
  );

  const onShowClick = () => {
    setShow(true);
  };

  const onHideClick = () => {
    setShow(false);
  };

  return (
    <>
      <LoadNewButton 
        text="Upload local files"
        onClick={ onShowClick }
      />

      <Modal show={ show } onHide={ onHideClick }>
        <Header closeButton>
          <Title>Upload files from your computer in CSV format</Title>
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
          <ListGroup variant="flush">
            <ListGroup.Item>
              { dataImage("Expression data (required):", ["1st column: Entrez gene id", "Subsequent columns: samples"], "ExpressionDataFormat.png") }
              <FileSelect onChange={ onExpressionFileSelect } />
            </ListGroup.Item>
            <ListGroup.Item>
              { dataImage("Properties data (optional):", ["1st row: headers", "Subsequent rows: samples"], "PropertiesDataFormat.png") }
              <FileSelect onChange={ onPropertiesFileSelect } />
            </ListGroup.Item>
            <ListGroup.Item>
              <h6>Description (optional):</h6>
              <Control 
                value={ description }
                onChange={ onDescriptionChange }
              />
            </ListGroup.Item>
          </ListGroup>
          <hr />
          <SpinnerButton
            variant="primary"
            disabled={ !expressionFile }
            onClick={ onUploadDataClick }
          >
            Upload
          </SpinnerButton>  
        </Body>
      </Modal>
    </>
  );
};           