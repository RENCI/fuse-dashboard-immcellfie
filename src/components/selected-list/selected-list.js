import React, { useContext, useState } from "react";
import { Row, Col, Form, InputGroup, ButtonGroup, Button, ToggleButton } from "react-bootstrap";
import { GraphUp, List } from "react-bootstrap-icons";
import { X } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { DetailVis } from "../detail-vis";

const { Control } = Form;
const { Append } = InputGroup;

export const SelectedList = ({ nodes, subgroup, subgroupName }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("list");

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
      <Row noGutters={ true }>
        <Col xs="auto" className="me-1">
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
            </Append>
          </InputGroup>
        </Col>
        <Col xs="auto" className="me-2">
          <ButtonGroup toggle>
            <ToggleButton
              type="radio"
              variant="outline-secondary"
              value="list"
              checked={ mode === "list" }
              className="d-flex align-items-center"
              onClick={ () => setMode("list") }
            >
              { <List />  }
            </ToggleButton>
            <ToggleButton
              type="radio"
              variant="outline-secondary"
              value="detail"
              checked={ mode === "detail" }
              className="d-flex align-items-center"
              onClick={ () => setMode("detail") }
            >
              { <GraphUp /> }
            </ToggleButton>
          </ButtonGroup>
        </Col>
        { mode === "list" &&
          <Col className="px-0">
            { tags }
          </Col>
        }
      </Row>
      { mode === "detail" && 
        <Row>
          { tooltips }
        </Row>
      }
    </>
  );
};
