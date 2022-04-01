import { useContext } from "react";
import { Card, Form, ButtonGroup, Button, } from "react-bootstrap";
import { PCAContext, DataContext } from "contexts";

const { Header, Body } = Card;
const { Label, Group, Control } = Form;

export const PCAControls = () => {
  const [{ numComponents }, dispatch] = useContext(PCAContext);
  const [{ dataset }] = useContext(DataContext);

  const onNumComponentsChange = event => {
    dispatch({ type: "setNumComponents", numComponents: +event.target.value });
  };

  const onRunPCAClick = async () => {

  };

  return (        
    <Card>
      <Header as="h5">
        PCA Parameters
      </Header>
      <Body>
        <Group controlId="num_components" className="mb-3">
          <Label><h6>Number of components</h6></Label>
          <Control 
            as="input"
            type="number"
            min={ 2 }
            value={ numComponents }
            onChange={ onNumComponentsChange }
          />
        </Group>
        <ButtonGroup style={{ width: "100%" }}>
          <Button 
            disabled={ !dataset }
            onClick={ onRunPCAClick }
          >
            { !dataset ? 
              <>No input data</>
            : <>Run PCA</>
            }
          </Button> 
        </ButtonGroup>
        { !dataset && 
          <div className="text-center">
            <Form.Text>Load input data</Form.Text>
          </div> 
        }
      </Body>
    </Card>
  );
};