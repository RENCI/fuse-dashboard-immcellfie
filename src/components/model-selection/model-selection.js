import React, { useState, useReducer, useContext, useEffect, useRef } from "react";
import { Row, Col, Card, Form, Button, ButtonGroup, InputGroup } from "react-bootstrap";
import { ArrowCounterclockwise, XLg } from "react-bootstrap-icons";
import { SpinnerButton } from "../spinner-button";
import { UserContext, DataContext, TaskStatusContext } from "../../contexts";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body } = Card;
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
  { name: "global", value: "global" },
  { name: "local", value: "local" }
];

const initialParameters = [
  {
    label: "Percentile or value",
    name: "PercentileOrValue",    
    default: "percentile",
    value: "percentile",
    options: [
      { name: "percentile", value: "percentile" },
      { name: "value", value: "value" }
    ]
  },
  {
    label: "Percentile",
    name: "Percentile",
    type: "global",
    default: 50,
    value: 50,
    range: [0, 100]
  },
  {
    label: "Value",
    name: "Value",
    type: "global",
    default: 5,
    value: 5,
    range: [0, Number.MAX_SAFE_INTEGER]
  },
  {
    label: "Local threshold type",
    name: "LocalThresholdType",
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
    name: "PercentileLow",
    type: "local",
    flag: "low",
    default: 25,
    value: 25,
    range: [0, 100]
  },
  {
    label: "High percentile",
    name: "PercentileHigh",
    type: "local",
    flag: "high",
    default: 75,
    value: 75,
    range: [0, 100]
  },
  {
    label: "Low value",
    name: "ValueLow",
    type: "local",
    flag: "low",
    default: 5,
    value: 5,
    range: [0, Number.MAX_SAFE_INTEGER]
  },
  {
    label: "High value",
    name: "ValueHigh",
    type: "local",
    flag: "high",
    default: 10,
    value: 10,
    range: [0, Number.MAX_SAFE_INTEGER]
  }
];

export const ModelSelection = () => {
  const [{ email }, userDispatch] = useContext(UserContext);
  const [{ dataInfo, expressionData, expressionFile }, dataDispatch] = useContext(DataContext);
  const [{ status }, taskStatusDispatch] = useContext(TaskStatusContext);
  const timer = useRef();
  const [organism, setOrganism] = useState("human");
  const [currentModels, setCurrentModels] = useState(models.filter(({ organism }) => organism === "human"));
  const [model, setModel] = useState(models.find(({ organism }) => organism === "human"));
  const [thresholdType, setThresholdType] = useState(thresholdTypes[0]);
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

  const organisms = models.reduce((organisms, model) => {
    if (!organisms.includes(model.organism)) organisms.push(model.organism);

    return organisms;
  }, []);

  useEffect(() => {
    if (status === "finished") {
      taskStatusDispatch({ type: "setStatus", status: null });
    }
  }, [status, taskStatusDispatch]);

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

  const onRunCellfieClick = async () => {
    try {
      if (dataInfo.source === "upload") {
        taskStatusDispatch({ type: "setStatus", status: "connecting" });

        const n = expressionData.length > 0 ? expressionData[0].values.length : 0;

        const id = await api.runCellfie(email, expressionFile, n, model.value, parameters.reduce((parameters, parameter) => {
          parameters[parameter.name] = parameter.value;
          return parameters; 
        }, { ThreshType: thresholdType.value }));      

        console.log(id);

/*        
        checkStatus();
        timer.current = setInterval(checkStatus, 5000);    

        async function checkStatus() {
          const status = await api.checkCellfieStatus(id);

          if (status === "finished") {
            clearInterval(timer.current);

            const output = await api.getCellfieOutput(id);

            dataDispatch({ type: "setOutput", output: output });
            taskStatusDispatch({ type: "setStatus", status: "finished" });

            const tasks = await api.getTasks(email);

            userDispatch({ type: "setTasks", tasks: tasks });
            userDispatch({ type: "setActiveTask", id: id });
          }
          else {
            taskStatusDispatch({ type: "setStatus", status: status });
          }
        }
*/        
      }
      else if (dataInfo.source === "practice") {
        taskStatusDispatch({ type: "setStatus", status: "started" });

        setTimeout(async () => {
          const taskInfo = await api.loadPracticeData(practiceData.taskInfo);
          const score = await api.loadPracticeData(practiceData.score);
          const scoreBinary = await api.loadPracticeData(practiceData.scoreBinary);
          const detailScoring = await api.loadPracticeData(practiceData.detailScoring);

          dataDispatch({ type: "setOutput", output: {
            taskInfo: taskInfo,
            score: score,
            scoreBinary: scoreBinary,
            detailScoring: detailScoring
          }});

          taskStatusDispatch({ type: "setStatus", status: null });
        }, 1000);
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  const onCancelCellfieClick = () => {
    clearInterval(timer.current);

    taskStatusDispatch({ type: "setStatus", status: null });
  }

  const currentParameters = parameters.filter(({ type, name }) => {
    const pv = name.toLowerCase().includes("percent") ? "percent" : 
      name.toLowerCase().includes("value") ? "value" : null;

    return !type || 
      (type === thresholdType.name && 
      (!pv || parameters.find(({ name }) => name === "PercentileOrValue").value.includes(pv)));
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
                  <ArrowCounterclockwise className="d-flex align-items-center"/>
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
                  <ArrowCounterclockwise className="d-flex align-items-center"/>
                </Button>
              </Append>
            </InputGroup>
          </Group>
        : null 
      );
    });

  return (
    <Card>
      <Header as="h5">
        CellFIE Parameters
      </Header>
      <Body>
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
            <ButtonGroup style={{ width: "100%" }}>
              <SpinnerButton 
                block
                disabled={ status !== null }
                spin={ status !== null }
                onClick={ onRunCellfieClick }
              >
                Run CellFIE
              </SpinnerButton> 
              { status !== null &&
                <Button 
                  variant="danger"
                  onClick={ onCancelCellfieClick }
                >
                  <XLg className="d-flex align-items-center" />
                </Button>
              }
            </ButtonGroup>
          </Col>       
        </Row>
      </Body>
    </Card>
  );
};