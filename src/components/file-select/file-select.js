import React, { useState } from "react";
import { Form } from "react-bootstrap";

const { File } = Form;

export const FileSelect = ({ defaultLabel, onChange }) => {
  const [file, setFile] = useState(null);

  const handleChange = evt => {
    const file = evt.target.files.length === 1 ? evt.target.files[0] : null;

    setFile(file);
    onChange(file);
  }

  const label = file ? 
    <><span className="text-muted">Selected: </span>{ file.name }</> :
    <span className="text-muted">{ defaultLabel }</span>;

  return (
    <File
      label={ label }
      custom        
      onChange={ handleChange }
    />
  );
};           