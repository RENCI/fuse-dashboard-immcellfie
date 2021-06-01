import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { ModelSelection } from "../components/model-selection";
import { SubgroupSelection } from "../components/subgroup-selection";
import { CellfieOutput } from "../components/cellfie-output";
import { DataMissing } from "../components/data-missing";

const practiceData = {
  output: "HPA.expected",
  outputType: "tsv",
  //output: "ASD.output",
  //output: "TD.output",
  //outputType: "csv"
};

export const OutputView = () => {
  const [{ phenotypeData, output }] = useContext(DataContext);
  
  return (
    <>
      { !phenotypeData ? 
        <ViewWrapper> 
          <DataMissing message="No data loaded" showHome={ true } /> 
        </ViewWrapper>
      :
        <Row>
          <Col xs={ 12 } xl={ 4 }>
            <ModelSelection 
              outputName={ practiceData.output } 
              outputType={ practiceData.outputType }
            />         
            <SubgroupSelection />         
          </Col>            
          <Col xs={ 12 } xl={ 8 }>
            <CellfieOutput /> 
          </Col>        
        </Row>
      }
    </>
  );  
};