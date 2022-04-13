import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "contexts";
import { SubgroupSelection } from "components/subgroup-selection";
import { ModelSelection } from "./model-selection";
import { CellfieOutput } from "./cellfie-output";

export const Cellfie = () => {
  const [{ subgroups }] = useContext(DataContext);

  return (        
    <Row>
      <Col xs={ 12 } xl={ 4 }>
        <ModelSelection />     
        { subgroups &&
          <div className="mt-4">
            <SubgroupSelection />  
          </div> 
        }  
      </Col>            
      <Col xs={ 12 } xl={ 8 }>
        <CellfieOutput /> 
      </Col>        
    </Row>
  );
};