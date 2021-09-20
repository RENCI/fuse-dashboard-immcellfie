import React from "react";
import { Row, Col } from "react-bootstrap";
import { DataSelection } from "../components/data-selection";

export const InputView = () => {
  return (   
    <Row className="mt-4">
      <Col>
        <DataSelection />
      </Col>
    </Row>
  ); 
};