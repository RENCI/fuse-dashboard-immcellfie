import { useState, useRef, useEffect } from "react";
import { Form, FormControl } from "react-bootstrap";
import styles from "./label-edit.module.css";

const { Label } = Form;

export const LabelEdit = ({ label, size = null, isNew = false, onChange }) => {
  const [editing, setEditing] = useState(isNew);
  const [editLabel, setEditLabel] = useState(label);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const onLabelClick = evt => {
    evt.stopPropagation();

    setEditing(true);
  };

  const onInputBlur = () => {
    setEditing(false);

    onChange(editLabel);
  };

  const onInputChange = evt => {
    setEditLabel(evt.target.value);
  };

  const onKeyPress = evt => {
    if (evt.code === "Enter") {
      inputRef.current.blur();
    }
  };

  const canEdit = onChange !== null;

  return (
    <>
      { editing && canEdit ? 
        <FormControl 
          ref={ inputRef }
          size={ size }
          value={ editLabel } 
          onBlur={ onInputBlur }
          onChange={ onInputChange }
          onKeyPress={ onKeyPress }
        />
      : <Label
          className={ styles.labelMode + (canEdit ? ` ${ styles.editable }` : "") }
          onClick={ onLabelClick }
        >
          { editLabel }
        </Label> 
      }
    </>
  );
};           