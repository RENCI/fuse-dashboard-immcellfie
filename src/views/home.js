import React from "react";
import { Row, Col } from "react-bootstrap";
import { ViewWrapper } from "../components/view-wrapper";
import { UserInput } from "../components/user-input";
import { DataSelection } from "../components/data-selection";

export const Home = () => {
  return (   
    <ViewWrapper>
      <Row>
        <Col>
          <UserInput />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <DataSelection />
        </Col>
      </Row>
    </ViewWrapper>
  ); 
};