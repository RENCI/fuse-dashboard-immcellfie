import React, { useState, useContext } from "react";
import { Form } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { FileSelect } from "../file-select";
import { states } from "./states";
import { api } from "../../utils/api";

const { Group } = Form;

export const UploadData = ({ state, onSetState, onError }) => {
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
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
    onError();

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

      onError(error);
    }

    onSetState(states.normal);
  };

  const disabled = state !== states.normal;

  return (
    <> 
      <h6>Upload files from your computer in CSV format</h6>
      <Group className="mb-3">
        <FileSelect
          label="Required: expression data"
          onChange={ onExpressionFileSelect }
        />
      </Group> 
      <Group className="mb-3">
        <FileSelect
          label="Optional: phenotype data"
          onChange={ onPhenotypeFileSelect }
        />
      </Group> 
      <Group>
        <SpinnerButton
          variant="primary"
          disabled={ disabled || !expressionDataFile }
          spin={ state === "uploading" }
          onClick={ onUploadDataClick }
        >
          Upload
        </SpinnerButton>              
      </Group>
    </>
  );
};           