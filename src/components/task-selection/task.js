import React, { useState } from "react";
import { ListGroup, Row, Col, Button, Collapse } from "react-bootstrap";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { TaskStatusIcon } from "../task-status-icon";
import "./task-selection.css";

const { Item } = ListGroup;

export const Task = ({ task, onClick }) => {
  const [expand, setExpand] = useState(false);

  const clickable = task.status !== "failed";

  const onExpandClick = evt => {
    evt.stopPropagation();

    setExpand(!expand);
  };

  return (
    <Item  
      as="li"
      key={ task.id }
      action={ clickable }
      className={ task.active ? "task-active" : null }
      onClick={ clickable ? () => onClick(task) : null }
    >
      <Row className="d-flex align-items-center">  
        <Col xs="auto" >
          <Button 
            size={ "sm "}
            variant={ "light" }
            onClick={ onExpandClick }
          >
            { expand ? <ChevronUp /> : <ChevronDown /> }
          </Button>
        </Col>      
        <Col>{ task.id }</Col>
        <Col xs="auto"><TaskStatusIcon task={ task } /></Col>
      </Row>      
      <Collapse in={ expand }>
        <div>Boo!</div>
      </Collapse>
    </Item>
  );
};