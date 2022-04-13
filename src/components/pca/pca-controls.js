import { useContext } from "react";
import { Card, Form, ButtonGroup, Button, } from "react-bootstrap";
import { PCAContext, UserContext, DataContext, ErrorContext } from "contexts";
import { BoldLabel } from "components/bold-label";

const { Header, Body } = Card;
const { Group, Control } = Form;

const service = "fuse-tool-pca";

export const PCAControls = () => {
  const [{ user }, userDispatch] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);
  const [{ numComponents, description }, pcaDispatch] = useContext(PCAContext);
  const [, errorDispatch] = useContext(ErrorContext);

  const onNumComponentsChange = event => {
    pcaDispatch({ type: "setNumComponents", numComponents: +event.target.value });
  };

  const onDescriptionChange = event => {
    pcaDispatch({ type: "setDescription", description: event.target.value });
  };

  const onRunPCAClick = async () => {
    try {
      userDispatch({
        type: "addDataset",
        dataset: {
          service: service,
          type: "result",
          user: user,
          parameters: {
            dataset: dataset.id,
            number_of_components: numComponents
          },
          description: description,
          createdTime: new Date()
        }
      });
    }
    catch (error) {
      errorDispatch({ type: "setError", error: error });
    }
  };

  return (        
    <Card>
      <Header as="h5">
        PCA Parameters
      </Header>
      <Body>
        <Group controlId="numComponents" className="mb-3">
          <BoldLabel>Number of components</BoldLabel>
          <Control 
            as="input"
            type="number"
            min={ 2 }
            value={ numComponents }
            onChange={ onNumComponentsChange }
          />
        </Group>
        <Group controlId="description" className="mb-3">
          <BoldLabel>Description</BoldLabel>
          <Control 
            as="input"
            value={ description }
            onChange={ onDescriptionChange }
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