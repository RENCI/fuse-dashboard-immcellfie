import { useState, useContext } from "react";
import { Modal, ListGroup, Figure, Alert, Form } from "react-bootstrap";
import { UserContext, DataContext, LoadingContext, ErrorContext } from "contexts";
import { SpinnerButton } from "components/spinner-button";
import { LoadNewButton } from "./load-new-button";
import { FileSelect } from "components/file-select";
import { states } from "./states";
import { api } from "utils/api";

const { Header, Title, Body } = Modal;
const { Image } = Figure;
const { Control } = Form;

export const UploadData = ({ state, onSetState }) => {
  const [{ user }, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
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
    userDispatch({ 
      type: "addDataset", 
      dataset: {
        provider: "fuse-provider-upload",
        user,
        expressionFile,
        propertiesFile,
        description,
        createdTime: new Date()
      }
    });

    setExpressionFile(null);
    setPropertiesFile(null);
    setDescription("");
    setShow(false);
/*    
    onSetState(states.uploading);

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {
      const expressionData = await api.loadFile(expressionFile);
      const propertiesData = propertiesFile ? await api.loadFile(propertiesFile) : null;

      dataDispatch({ 
        type: "setDataInfo", 
        source: { name: "upload" },
        propertiess: { name: propertiesFile ? propertiesFile.name : "Auto-generated" },
        expression: { name: expressionFile.name }
      });

      // Set properties data first
      if (propertiesData) dataDispatch({ type: "setPropertiess", data: propertiesData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }

    onSetState(states.normal);
*/    
  };

  const dataImage = (label, description, src) => (
    <>
      <h6>{ label }</h6>
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
              { dataImage("Properties data (optional):", ["1st row: headers", "Subsequent rows: samples"], "PhenotypeDataFormat.png") }
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
            disabled={ disabled || !expressionFile }
            spin={ state === "uploading" }
            onClick={ onUploadDataClick }
          >
            Upload
          </SpinnerButton>  
        </Body>
      </Modal>
    </>
  );
};           