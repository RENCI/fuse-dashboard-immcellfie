import React from "react";
import { ListGroup, Row, Col } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";
import { TaskStatusIcon } from "../task-status-icon";

const { Item } = ListGroup;

export const Task = ({ task, onClick }) => {
  const clickable = task.status !== "failed";

  return (
    <Item  
      key={ task.id }
      action={ clickable }
      onClick={ clickable ? () => onClick(task) : null }
    >
      <Row className="d-flex align-items-center">
        <Col xs="auto" style={{ visibility: !task.active ? "hidden" : null }}><ArrowRight /></Col>        
        <Col>{ task.id }</Col>
        <Col xs="auto"><TaskStatusIcon task={ task } /></Col>
      </Row>
    </Item>
  );
};