import React from "react";
import { ListGroup, Row, Col, Spinner } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

const { Item } = ListGroup;

export const Task = ({ task, onClick }) => {
  const variant = task.status === "connecting" ? "primary" :
    task.status === "queued" ? "info" :
    "success";

  const icon = task.status === "finished" ? <CheckCircle className="text-success ml-1" /> :
    task.status === "failed" ? <XCircle className="text-danger ml-1" /> :
    <Spinner animation="border" size="sm" className="ml-1" variant={ variant } />;

  return (
    <Item  
      key={ task.id }
      variant={ task.active ? "primary" : null }
      action
      disabled={ task.status !== "finished" }
      onClick= { () => onClick(task) }
    >
      <Row className="d-flex align-items-center">        
        <Col>{ task.id }</Col>
        <Col xs="auto">{ icon }</Col>
      </Row>
    </Item>
  );
};