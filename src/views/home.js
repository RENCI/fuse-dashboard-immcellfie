import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { UserInput } from "../components/user-input";
import { DataSelection } from "../components/data-selection";

export const Home = () => {
  const [{ email }, dispatch] = useContext(UserContext);

  return (   
    <ViewWrapper>
      <Row>
        <Col>
          <UserInput />
        </Col>
      </Row>
      { email &&
        <Row className="mt-4">
          <Col>
            <DataSelection />
          </Col>
        </Row>
      }
    </ViewWrapper>
  ); 
};