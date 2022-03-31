import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { ModelSelection } from "components/model-selection";
import { SubgroupSelection } from "components/subgroup-selection";
import { TaskSelection } from "components/task-selection";
import { CellfieOutput } from "components/cellfie-output";
import { DataMissing } from "components/data-missing";
import { UserLink, InputLink } from "components/page-links";

export const OutputView = () => {
  const location = useLocation();
  const [{ user }] = useContext(UserContext);
  const [{ result, propertiesData, properties }] = useContext(DataContext);

  console.log(location);

  const tool = location.hash.slice(1);

  return (
    <>
      { !user ?
        <ViewWrapper>
          <DataMissing message="No user selected" pageLink={ <UserLink /> } /> 
        </ViewWrapper>
      : 
        !propertiesData ? 
        <ViewWrapper> 
          <DataMissing message="No data loaded" pageLink={ <InputLink /> } /> 
        </ViewWrapper>
      :
        tool === "cellfie" ?
        <Row>
          <Col xs={ 12 } xl={ 4 }>
            <ModelSelection />     
            { properties.length > 0 &&
              <div className="mt-4">
                <SubgroupSelection />  
              </div> 
            }                  
            <div className="mt-4">
              <TaskSelection />  
            </div>   
          </Col>            
          <Col xs={ 12 } xl={ 8 }>
            <CellfieOutput /> 
          </Col>        
        </Row>
      : tool === "pca" ?
        <>PCA</>
      :
        null
      }
    </>
  );  
};