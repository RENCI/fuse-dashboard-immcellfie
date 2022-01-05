import React, { useState } from "react";
import { Form } from "react-bootstrap";

const { Control } = Form;

export const FileSelect = ({ defaultLabel, onChange }) => {
  const [file, setFile] = useState(null);

  const handleChange = evt => {
    const file = evt.target.files.length === 1 ? evt.target.files[0] : null;

    setFile(file);
    onChange(file);
  }

  const label = file ? 
    file.name :
    <span className="text-muted">{ defaultLabel }</span>;

  return (
    <Control
      type="file"
      label={ label }
      custom        
      onChange={ handleChange }
    />
  );
};           