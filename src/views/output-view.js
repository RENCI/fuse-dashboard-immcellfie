import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { ModelSelection } from "../components/model-selection";
import { SubgroupSelection } from "../components/subgroup-selection";
import { TaskSelection } from "../components/task-selection";
import { CellfieOutput } from "../components/cellfie-output";
import { DataMissing } from "../components/data-missing";

export const OutputView = () => {
  const [{ phenotypeData }] = useContext(DataContext);
  
  return (
    <>
      { !phenotypeData ? 
        <ViewWrapper> 
          <DataMissing message="No data loaded" showHome={ true } /> 
        </ViewWrapper>
      :
        <Row>
          <Col xs={ 12 } xl={ 4 }>
            <ModelSelection />         
            <div className="mt-4">
              <SubgroupSelection />  
            </div>               
            <div className="mt-4">
              <TaskSelection />  
            </div>   
          </Col>            
          <Col xs={ 12 } xl={ 8 }>
            <CellfieOutput /> 
          </Col>        
        </Row>
      }
    </>
  );  
};