import { useState } from "react";
import { Form, Col, InputGroup, Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";

const { Group, Label, Control } = Form; 

export const TaskSearch = ({ nodes, onSearch }) => {
  const [text, setText] = useState("");

  const onTextChange = evt => {
    setText(evt.target.value);
    onSearch(evt.target.value);
  };

  const onClearClick = () => {
    setText("");
    onSearch("");
  };

  const options = nodes.filter(node => {
    return node.depth > 0 && node.depth < 4 && !node.data.selected;
  }).map(({ data }, i) => {
    return <option key={ i } value={ data.name } />;
  });

  return (
    <Group as={ Col } controlId="taskSearch">
      <Label>Search</Label>
      <InputGroup size="sm">
        <Control  
          list="selectOptions"
          placeholder="Search"
          value={ text }
          onChange={ onTextChange }
        />
        <datalist id="selectOptions">
          { options }
        </datalist>
        <Button 
          variant="outline-secondary"
          disabled={ text === "" }
          onClick={ onClearClick }
        >
          <X className="icon-offset" />
        </Button>
      </InputGroup>
    </Group>
  );
};           