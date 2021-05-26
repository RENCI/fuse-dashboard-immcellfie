import React, { useContext, useState } from "react";
import { Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { GraphUp, List } from "react-bootstrap-icons";
import { X } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { DetailVis } from "../detail-vis";

const { Control } = Form;
const { Append } = InputGroup;

export const SelectedList = ({ nodes, subgroup, subgroupName }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [text, setText] = useState("");
  const [expand, setExpand] = useState(false);

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

  const onClearClick = () => {
    dataDispatch({ type: "deselectAllNodes" });
  };

  const onExpandClick = () => {
    setExpand(!expand);
  };

  const options = nodes.filter(node => {
    return node.depth > 0 && node.depth < 4 && !node.data.selected;
  }).map(({ data }, i) => {
    return <option key={ i } value={ data.name } />;
  });

  const selected = nodes.filter(({ data }) => data.selected);

  const tags = selected.map(({ data }, i, a) => {
    return (
      <span key={ i }>
        <small className="text-muted">
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
      </span>
    );
  });

  const tooltips = selected.map(({ data }, i) => {
    return (
      <Col 
        key={ i }
        xs="auto"
        className="mt-3"
      >
        <DetailVis 
          data={ data }
          subgroup={ subgroup }
          subgroupName={ subgroupName }
          onCloseClick={ onCloseClick }
        />
      </Col>
    );
  });

  return (
    <>
      <Row>
        <Col xs="auto">
          <InputGroup size="sm">
            <Control  
              list="selectOptions"
              placeholder="Select"
              value={ text }
              onChange={ onTextChange }
              onBlur={ onTextBlur }
            />
            <datalist id="selectOptions">
              { options }
            </datalist>
            <Append>
              <Button 
                variant="outline-secondary"
                disabled={ selected.length === 0 }
                onClick={ onClearClick }
              >
                Clear
              </Button>
              <Button
                variant="outline-secondary"
                onClick={ onExpandClick }
                className="d-flex align-items-center"
              >
                { expand ? <List /> : <GraphUp /> }
              </Button>
            </Append>
          </InputGroup>
        </Col>
        { !expand &&
          <Col className="px-0">
            { tags }
          </Col>
        }
      </Row>
      { expand && 
        <Row>
          { tooltips }
        </Row>
      }
    </>
  );
};
