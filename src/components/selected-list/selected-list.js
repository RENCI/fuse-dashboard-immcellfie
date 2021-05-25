import React, { useContext, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";

const { Control } = Form;

export const SelectedList = ({ nodes }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [text, setText] = useState("");

  const onCloseClick = name => {
    dataDispatch({ type: "selectNode", name: name, selected: false });
  };

  const onTextChange = evt => {
    setText(evt.target.value);
  };

  const onTextBlur = () => {
    dataDispatch({ type: "selectNode", name: text, selected: true });

    setText("");
  };

  const options = nodes.filter(node => {
    return node.depth > 0 && node.depth < 4 && !node.data.selected;
  }).map(({ data }, i) => {
    return <option key={ i } value={ data.name } />;
  });

  const selected = nodes.filter(({ data }) => data.selected).map(({ data }, i, a) => {
    return (
      <>
        <small 
          key={ i }
          className="text-muted"
        >
          { data.name }
        </small>
        <Button 
          variant="link"
          className="text-muted p-0 mb-1"
          onClick={ () => onCloseClick(data.name) }
        >
          <X />
        </Button>
        { i < a.length - 1 && <small>, </small> }
      </>
    );
  });

  return (
    <Row>
      <Col xs="auto">
        <Control  
          size="sm"
          list="selectOptions"
          placeholder="Select"
          value={ text }
          onChange={ onTextChange }
          onInput={ onTextInput }
          onClick={ onTextClick }
          onBlur={ onTextBlur }
        />
        <datalist id="selectOptions">
          { options }
        </datalist>
      </Col>
      <Col className="px-0">
        { selected }
      </Col>
    </Row>
  );
};
