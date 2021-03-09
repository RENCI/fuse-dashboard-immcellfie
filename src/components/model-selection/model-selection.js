import React, { useState, useContext } from "react";
import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { api } from "../../api";

const { Title, Body } = Card;
const { Label, Group, Control, Switch } = Form;

const organisms = [
  "human",
  "mouse",
  "rat",
  "hamster"
];

const models = [
  { organism: "human", name: "iHSA" },
  { organism: "human", name: "recon_v1" },
  { organism: "human", name: "recon_v2" },
  { organism: "human", name: "recon_v2.2" },
  { organism: "hamster", name: "iCHOv1" },
  { organism: "mouse", name: "iMM1416" },
  { organism: "mouse", name: "inesMouseModel" },
  { organism: "mouse", name: "quek" },
  { organism: "rat", name: "iRno" }
];

export const ModelSelection = () => {
  const [data] = useContext(DataContext);
  const [organism, setOrganism] = useState("human");
  const [currentModels, setCurrentModels] = useState(models.filter(({ organism }) => organism === "human"));
  const [model, setModel] = useState(models.find(({ organism }) => organism === "human"));

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

  return (
    <Card>
      <Body>
        <Title>Model Selection</Title>
        <Row>
          <Col>
            <Group>
              <Label>Organism</Label>
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
            <Group>
              <Label>Model</Label>
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
            <Label>Model Parameters</Label>
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
            <Button 
              size="lg" 
              block
            >
              Run CellFIE
            </Button>
          </Col>
        </Row>
      </Body>
    </Card>
  );
};           