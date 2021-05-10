import React, { useState, useReducer, useContext } from "react";
import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { api } from "../../api";

const { Title, Body } = Card;
const { Label, Group, Control } = Form;
const { Append } = InputGroup;

const models = [
  { organism: "human", name: "iHSA", value: "MT_iHsa.mat" },
  { organism: "human", name: "recon v1", value: "MT_recon_1.mat" },
  { organism: "human", name: "recon v2", value: "MT_recon_2.mat" },
  { organism: "human", name: "recon v2.2", value: "MT_recon_2_2_entrez.mat" },
  { organism: "mouse", name: "iMM1416", value: "MT_iMM1415.mat" },
//  { organism: "mouse", name: "inesMouseModel" },
  { organism: "mouse", name: "quek", value: "MT_quek14.mat" },
  { organism: "rat", name: "iRno", value: "MT_iRno.mat" },
  { organism: "Chinese hamster", name: "iCHOv1", value: "MT_iCHOv1_final.mat" }
];

const thresholdTypes = [
  { name: "global", value: "global-thresh" },
  { name: "local", value: "local-thresh" }
];

const initialParameters = [
  {
    label: "Percentile or value",
    name: "percentile_or_value",    
    default: "--percent",
    value: "--percent",
    options: [
      { name: "percentile", value: "--percent" },
      { name: "value", value: "--value" }
    ]
  },
  {
    label: "Percentile",
    name: "percentile",
    type: "global",
    default: 50,
    value: 50,
    range: [0, 100]
  },
  {
    label: "Value",
    name: "value",
    type: "global",
    default: 5,
    value: 5,
    range: [0, Number.MAX_SAFE_INTEGER]
  },
  {
    label: "Local threshold type",
    name: "local_threshold_type",
    type: "local",
    flag: "-t",
    default: "minmaxmean",
    value: "minmaxmean",
    options: [
      { name: "min-max mean", value: "minmaxmean" }, 
      { name: "mean", value: "mean" }
    ]
  },
  {
    label: "Low percentile",
    name: "low_percentile",
    type: "local",
    flag: "--low",
    default: 25,
    value: 25,
    range: [0, 100]
  },
  {
    label: "High percentile",
    name: "high_percentile",
    type: "local",
    flag: "--high",
    default: 75,
    value: 75,
    range: [0, 100]
  },
  {
    label: "Low value",
    name: "low_value",
    type: "local",
    flag: "--low",
    default: 5,
    value: 5,
    range: [0, Number.MAX_SAFE_INTEGER]
  },
  {
    label: "High percentile",
    name: "high_value",
    type: "local",
    flag: "--high",
    default: 10,
    value: 10,
    range: [0, Number.MAX_SAFE_INTEGER]
  }
];

export const ModelSelection = ({ outputName, outputType }) => {
  const [, dataDispatch] = useContext(DataContext);
  const [organism, setOrganism] = useState("human");
  const [currentModels, setCurrentModels] = useState(models.filter(({ organism }) => organism === "human"));
  const [model, setModel] = useState(models.find(({ organism }) => organism === "human"));
  const [thresholdType, setThresholdType] = useState(thresholdTypes[0]);
  const [running, setRunning] = useState(false);
  const [parameters, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "setValue":  {
        const newState = [...state];

        const parameter = newState.find(({ name }) => name === action.name);

        parameter.value = action.value;

        return newState;
      }

      case "resetValue":  {
        const newState = [...state];

        const parameter = newState.find(({ name }) => name === action.name);

        parameter.value = parameter.default;

        return newState;
      }

      default:
        throw new Error("Invalid parameters action: " + action.type);
    }
  }, initialParameters);
  //const [message, setMessage] = useState();

  const organisms = models.reduce((organisms, model) => {
    if (!organisms.includes(model.organism)) organisms.push(model.organism);

    return organisms;
  }, []);

  const onOrganismChange = evt => {
    const value = evt.target.value;
    const newModels = models.filter(({ organism }) => organism === value);

    setOrganism(value);
    setCurrentModels(newModels);
    setModel(newModels[0]);
  };

  const onModelChange = evt => {
    setModel(models.find(({ value }) => value === evt.target.value));
  };

  const onThresholdTypeChange = evt => {
    setThresholdType(thresholdTypes.find(({ value }) => value === evt.target.value));
  };

  const onParameterChange = (name, value) => {
    dispatch({ type: "setValue", name: name, value: value });
  };

  const onParameterReset = name => {
    dispatch({ type: "resetValue", name: name });
  };

  const onRunCellfieClick = () => {
    setRunning(true);

    setTimeout(async () => {
      const output = await api.loadPracticeData(outputName);

      dataDispatch({ type: "setOutput", file: output, fileType: outputType });

      setRunning(false);
//      setMessage("CellFIE output data loaded");
    }, 1000);
  };

  const currentParameters = parameters.filter(({ type, name }) => {
    const pv = name.includes("percent") ? "percent" : name.includes("value") ? "value" : null;

    return !type || 
      (type === thresholdType.name && 
      (!pv || parameters.find(({ name }) => name === "percentile_or_value").value.includes(pv)));
  }).map((parameter, i) => {
      return (
        parameter.options ?
          <Group key={ i } controlId={ parameter.name + "_select" }>
            <Label><small>{ parameter.label }</small></Label>
            <InputGroup size="sm">
              <Control 
                as="select"
                value={ parameter.value }
                onChange={ evt => onParameterChange(parameter.name, evt.target.value) }
              >
                { parameter.options.map(({ name, value }, i) => (
                  <option key={ i } value={ value }>{ name }</option>
                ))}
              </Control>
              <Append>
                <Button 
                  variant="outline-secondary"
                  onClick={ () => onParameterReset(parameter.name) }
                >
                  <ArrowCounterclockwise className="mb-1" />
                </Button>
              </Append>
            </InputGroup>
          </Group>
        : parameter.range ?
          <Group key={ i } controlId={ parameter.name + "_number" }>
            <Label><small>{ parameter.label }</small></Label>
            <InputGroup size="sm">
              <Control 
                as="input"
                type="number"
                min={ parameter.range[0] }
                max={ parameter.range[1] }
                value={ parameter.value }
                onChange={ evt => onParameterChange(parameter.name, +evt.target.value) }
              />
              <Append>
                <Button 
                  variant="outline-secondary"
                  onClick={ () => onParameterReset(parameter.name) }
                >
                  <ArrowCounterclockwise className="mb-1" />
                </Button>
              </Append>
            </InputGroup>
          </Group>
        : null 
      );
    });

  return (
    <Card>
      <Body>
        <Title>CellFIE Parameters</Title>
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
                value={ model.value }
                onChange={ onModelChange }
              >
                { currentModels.map(({ name, value }, i) => (
                  <option key={ i } value={ value }>{ name }</option>
                ))}
              </Control>
            </Group>
          </Col>
          <Col>
            <Group controlId="threshold_type_select">
            <Label><h6>Threshold type</h6></Label>
              <Control 
                as="select"
                value={ thresholdType.value }
                onChange={ onThresholdTypeChange }
              >
                { thresholdTypes.map(({ name, value }, i) => (
                  <option key={ i } value={ value }>{ name }</option>
                ))}
              </Control>
            </Group>
            <Label>
              <h6>
                <span className="text-capitalize">{ thresholdType.name }</span> 
                <> thresholding parameters</>
              </h6>
            </Label>
            { currentParameters }
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
          </Col>
        </Row>
      </Body>
    </Card>
  );
};           

/*
            { message && 
              <Group>  
               <Alert variant="info">{ message }</Alert>
              </Group>  
            }
*/