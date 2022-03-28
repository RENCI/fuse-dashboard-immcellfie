import { useContext, useState } from "react";
import { Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { ConfigContext, UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { ModelSelection } from "components/model-selection";
import { SubgroupSelection } from "components/subgroup-selection";
import { TaskSelection } from "components/task-selection";
import { CellfieOutput } from "components/cellfie-output";
import { DataMissing } from "components/data-missing";
import { UserLink, InputLink } from "components/page-links";

export const OutputView = () => {
  const [{ tools }] = useContext(ConfigContext);
  const [{ user }] = useContext(UserContext);
  const [{ result, propertiesData, properties }] = useContext(DataContext);
  const [tool, setTool] = useState(result ? result.provider : tools[0]);

  const onToolChange = tool => {
    console.log(tool);
  };

  console.log(tools);
  console.log(result);
  console.log(tool);

  return (
    <>
      <ToggleButtonGroup
        type="radio"
        name="toolButtons"
        value={ tool }
        onChange={ onToolChange }
      >
        { tools.map((tool, i) => (
          <ToggleButton 
            key={ i }
            id={ `toolButton_${ tool }` }
            variant="outline-primary"
            value={ tool }
          >
            { tool }
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      { !user ?
        <ViewWrapper>
          <DataMissing message="No user selected" pageLink={ <UserLink /> } /> 
        </ViewWrapper>
      : !propertiesData ? 
        <ViewWrapper> 
          <DataMissing message="No data loaded" pageLink={ <InputLink /> } /> 
        </ViewWrapper>
      :        
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
      }
    </>
  );  
};