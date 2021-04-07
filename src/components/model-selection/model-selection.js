import React, { useState, useContext } from "react";
import { Row, Col, Card, Form, Alert } from "react-bootstrap";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { api } from "../../api";

const { Title, Body } = Card;
const { Label, Group, Control, Switch } = Form;

const organisms = [
  "human",
  "mouse",
  "rat",
  "Chinese hamster"
];

const models = [
  { organism: "human", name: "iHSA" },
  { organism: "human", name: "recon_v1" },
  { organism: "human", name: "recon_v2" },
  { organism: "human", name: "recon_v2.2" },
  { organism: "Chinese hamster", name: "iCHOv1" },
  { organism: "mouse", name: "iMM1416" },
  { organism: "mouse", name: "inesMouseModel" },
  { organism: "mouse", name: "quek" },
  { organism: "rat", name: "iRno" }
];

export const ModelSelection = ({ outputName, outputType }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [organism, setOrganism] = useState("human");
  const [currentModels, setCurrentModels] = useState(models.filter(({ organism }) => organism === "human"));
  const [model, setModel] = useState(models.find(({ organism }) => organism === "human"));
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState();

  const onOrganismChange = evt => {
    const value = evt.target.value;
    const newModels = models.filter(({ organism }) => organism === value);

    setOrganism(value);
    setCurrentModels(newModels);
    setModel(newModels[0]);
  };

  const onModelChange = evt => {
    setModel(models.find(({ name }) => name === evt.target.value));
  }

  const onRunCellfieClick = () => {
    setRunning(true);

    setTimeout(async () => {
      const output = await api.loadPracticeData(outputName);

      dataDispatch({ type: "setOutput", file: output, fileType: outputType });

      setRunning(false);
      setMessage("CellFIE output data loaded");
    }, 1000);
  };

  return (
    <Card>
      <Body>
        <Title>Model Selection</Title>
        <Row>
          <Col>
            <Group controlId="organism_select">
              <Label><h6>Organism</h6></Label>
              <Control 
                as="select"
                value={ organism }
                onChange={ onOrganismChange }
              >
                { organisms.map((organism, i) => (
                  <option key={ i }>{ organism }</option>
                ))}
              </Control>
            </Group>
            <Group controlId="model_select">
            <Label><h6>Model</h6></Label>
              <Control 
                as="select"
                value={ model.name }
                onChange={ onModelChange }
              >
                { currentModels.map(({ name }, i) => (
                  <option key={ i }>{ name }</option>
                ))}
              </Control>
            </Group>
          </Col>
          <Col>
            <Label><h6>Model parameters</h6></Label>
            <Group controlId="parameter1">
              <Label><small>Parameter 1</small></Label>
              <Control 
                as="select"
                size="sm"
              >
                <option>Option 1</option>
                <option>Option 2</option> 
              </Control>
            </Group>
            <Group controlId="parameter2">
              <Label><small>Parameter 2</small></Label>
              <Control 
                as="input"
                type="number"
                size="sm"
                defaultValue="1"
              />
            </Group>
            <Group controlId="parameter3">
              <Label><small>Parameter 3</small></Label>
              <Switch  />
            </Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Group>
              <SpinnerButton 
                block
                disabled={ running }
                spin={ running }
                onClick={ onRunCellfieClick }
              >
                Run CellFIE
              </SpinnerButton>
            </Group>
            { message && 
              <Group>  
                <Alert variant="info">{ message }</Alert>
              </Group>  
            }
          </Col>
        </Row>
      </Body>
    </Card>
  );
};           