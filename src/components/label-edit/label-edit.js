import React, { useState, useRef, useEffect } from "react";
import { Form, FormControl } from "react-bootstrap";
import "./label-edit.css";

const { Label } = Form;

export const LabelEdit = ({ subgroup, isNew, onChange }) => {
  const [editName, setEditName] = useState(isNew);
  const [name, setName] = useState(subgroup.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [editName]);

  const onNameLabelClick = () => {
    setEditName(true);
  };

  const onNameInputBlur = () => {
    setEditName(false);

    onChange(name);
  };

  const onNameInputChange = evt => {
    setName(evt.target.value);
  };

  const onKeyPress = evt => {
    if (evt.code === "Enter") {
      inputRef.current.blur();
    }
  };

  const canEdit = onChange !== null;

  return (
    <>
      { editName && canEdit ? 
        <FormControl 
          ref={ inputRef }
          value={ name } 
          onBlur={ onNameInputBlur }
          onChange={ onNameInputChange }
          onKeyPress={ onKeyPress }
        />
      : <Label
          className={ "labelMode " + (canEdit ? "editable" : "") }
          onClick={ onNameLabelClick }
        >
          { subgroup.name }
        </Label> 
      }
    </>
  );
};           