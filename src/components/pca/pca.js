import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { DataContext } from "contexts";
import { SubgroupSelection } from "components/subgroup-selection";
import { PCAControls } from "./pca-controls";
import { PCAOutput } from "./pca-output";

export const PCA = () => {
  const [{ properties }] = useContext(DataContext);

  return (        
    <Row>
      <Col xs={ 12 } xl={ 4 }>
        <PCAControls />
        { properties.length > 0 &&
          <div className="mt-4">
            <SubgroupSelection />  
          </div> 
        }          
      </Col>   
      <Col xs={ 12 } xl={ 8 }>
        <PCAOutput />
      </Col>
    </Row>
  );
};