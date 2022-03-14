import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { ModelSelection } from "../components/model-selection";
import { SubgroupSelection } from "../components/subgroup-selection";
import { TaskSelection } from "../components/task-selection";
import { CellfieOutput } from "../components/cellfie-output";
import { DataMissing } from "../components/data-missing";
import { UserLink, InputLink } from "../components/page-links";

export const OutputView = () => {
  const [{ user, tasks }] = useContext(UserContext);
  const [{ phenotypeData }] = useContext(DataContext);
  
  return (
    <>
      { !user ?
        <ViewWrapper>
          <DataMissing message="No user user selected" pageLink={ <UserLink /> } /> 
        </ViewWrapper>
      : !phenotypeData && tasks.length === 0 ? 
        <ViewWrapper> 
          <DataMissing message="No data loaded and no CellFIE tasks" pageLink={ <InputLink /> } /> 
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