import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "../contexts";
import { DataSelection } from "../components/data-selection";
import { ModelSelection } from "../components/model-selection";

const practiceData = {
  input: "HPA.tsv",
  output: "HPA.expected",
  outputType: "tsv"
  //output: "ASD.output",
  //output: "TD.output",
  //outputType: "csv"
};

export const Home = () => {
  const [data] = useContext(DataContext);

  return (    
    <>
      <Row>
        <Col>
          <DataSelection 
            inputName={ practiceData.input } 
          />
        </Col>
      </Row>
      { data.input && 
        <Row className="mt-4">
          <Col>
            <ModelSelection 
              outputName={ practiceData.output } 
              outputType={ practiceData.outputType }
            />
          </Col>
        </Row>
      }
    </>
  ); 
};