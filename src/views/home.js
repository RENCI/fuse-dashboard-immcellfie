import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "../contexts";
import { DataSelection } from "../components/data-selection";
import { ModelSelection } from "../components/model-selection";

export const Home = () => {
  const [data] = useContext(DataContext);

  return (    
    <>
      <Row>
        <Col>
          <DataSelection />
        </Col>
      </Row>
      { data.input && 
        <Row className="mt-4">
          <Col>
            <ModelSelection />
          </Col>
        </Row>
      }
    </>
  ); 
};