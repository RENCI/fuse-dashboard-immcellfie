import React, { useState } from "react";
import { Form } from "react-bootstrap";

const { Control, Label } = Form;

export const FileSelect = ({ label, onChange }) => {
  const [file, setFile] = useState(null);

  const handleChange = evt => {
    const file = evt.target.files.length === 1 ? evt.target.files[0] : null;

    setFile(file);
    onChange(file);
  };

  return (
    <>
      <Label className="text-muted">{ label }</Label>
      <Control
        type="file"
        label={ label }
        placeholder="DLKJF"
        custom        
        onChange={ handleChange }
      />
    </>
  );
};           