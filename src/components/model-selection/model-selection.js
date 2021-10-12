import React, { useContext } from "react";
import { Row, Col, Card, Form, Button, ButtonGroup, InputGroup } from "react-bootstrap";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { UserContext, DataContext, ModelContext } from "../../contexts";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body } = Card;
const { Label, Group, Control } = Form;
const { Append } = InputGroup;

export const ModelSelection = () => {
  const [{ email }, userDispatch] = useContext(UserContext);
  const [{ dataInfo, rawExpressionData, expressionData, rawPhenotypeData }, dataDispatch] = useContext(DataContext);
  const [{ organism, model, parameters }, modelDispatch] = useContext(ModelContext); 

  const thresholdType = parameters.find(({ name }) => name === "ThreshType"); 

  const onOrganismChange = evt => {
    modelDispatch({ type: "setOrganism", value: evt.target.value });
  };

  const onModelChange = evt => {
    modelDispatch({ type: "setModel", value: evt.target.value });
  };

  const onParameterChange = (name, value) => {
    modelDispatch({ type: "setParameterValue", name: name, value: value });
  };

  const onParameterReset = name => {
    modelDispatch({ type: "resetParameterValue", name: name });
  };

  const onRunCellfieClick = async () => {
    try {
      const n = expressionData.length > 0 ? expressionData[0].values.length : 0;

      // Create blobs
      const dataBlob = data => {
        return new Blob([data], { type: "mimeString" });
      };

      const expressionBlob = dataBlob(rawExpressionData);
      const phenotypesBlob = dataBlob(rawPhenotypeData);

      // Run Cellfie
      const id = await api.runCellfie(email, expressionBlob, phenotypesBlob, n, model.value.value, parameters.reduce((parameters, parameter) => {
        parameters[parameter.name] = parameter.value;
        return parameters; 
      }, {}));     

      // Get task info
      const params = await api.getCellfieTaskParameters(id);
      const info = await api.getCellfieTaskInfo(id);

      // Create task
      userDispatch({ type: "addTask", id: id, status: "submitting", parameters: params, info: info });
      userDispatch({ type: "setActiveTask", id: id });      
      
      dataDispatch({ type: "clearOutput" });
    }
    catch (error) {
      console.log(error);
    }
  };

  const currentParameters = parameters.filter(({ type, name }) => {
    if (name === "ThreshType") return false;

    const pv = name.toLowerCase().includes("percent") ? "percent" : 
      name.toLowerCase().includes("value") ? "value" : null;

    return !type || 
      (type === thresholdType.value && 
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
                value={ organism.value }
                onChange={ onOrganismChange }
              >
                { organism.options.map((organism, i) => (
                  <option key={ i }>{ organism }</option>
                ))}
              </Control>
            </Group>
            <Group controlId="model_select">
            <Label><h6>Model</h6></Label>
              <Control 
                as="select"
                value={ model.value.value }
                onChange={ onModelChange }
              >
                { model.options.map(({ name, value }, i) => (
                  <option key={ i } value={ value }>{ name }</option>
                ))}
              </Control>
            </Group>
          </Col>
          <Col>
            <Group controlId="threshold_type_select">
              <Label><h6>{ thresholdType.name }</h6></Label>
              <Control 
                as="select"
                value={ thresholdType.value }
                onChange={ evt => onParameterChange(thresholdType.name, evt.target.value) }
              >
                { thresholdType.options.map(({ name, value }, i) => (
                  <option key={ i } value={ value }>{ name }</option>
                ))}
              </Control>
            </Group>
            <Label>
              <h6>
                <span className="text-capitalize">{ thresholdType.value }</span> 
                <> thresholding parameters</>
              </h6>
            </Label>
            { currentParameters }
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonGroup style={{ width: "100%" }}>
              <Button 
                block
                onClick={ onRunCellfieClick }
              >
                Run CellFIE
              </Button> 
            </ButtonGroup>
          </Col>       
        </Row>
      </Body>
    </Card>
  );
};