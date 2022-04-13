import { useContext } from "react";
import { Row, Col, Card, Form, Button, ButtonGroup, InputGroup } from "react-bootstrap";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import { UserContext, DataContext, ModelContext, ErrorContext } from "contexts";
import { BoldLabel } from "components/bold-label";

const { Header, Body } = Card;
const { Label, Group, Control } = Form;

const service = "fuse-tool-cellfie";

const getParameterObject = parameters => (
  parameters.reduce((parameters, parameter) => {
    parameters[parameter.name] = parameter.value;
    return parameters; 
  }, {})
);

export const ModelSelection = () => {
  const [{ user }, userDispatch] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext); 
  const [{ organism, model, parameters, description }, modelDispatch] = useContext(ModelContext);
  const [, errorDispatch] = useContext(ErrorContext);

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

  const onDescriptionChange = event => {
    modelDispatch({ type: "setDescription", description: event.target.value });
  };

  const onRunCellfieClick = async () => {
    try {
      userDispatch({
        type: "addDataset",
        dataset: {
          service: service,
          type: "result",
          user: user,
          parameters: {
            dataset: dataset.id,
            model: model,
            ...getParameterObject(parameters)
          },
          description: description,
          createdTime: new Date()
        }
      });
    }
    catch (error) {
      errorDispatch({ type: "setError", error: error });
    }
/*    
    if (dataInfo.source.name === "ImmuneSpace") {
      try {
        const n = dataInfo.properties.numSamples;
        const downloadId = dataInfo.source.downloadId;

        // Run Cellfie
        const id = await api.runImmuneSpaceCellfie(downloadId, n, model.value.value, getParameterObject(parameters));

        // Get task info
        const params = await api.getCellfieTaskParameters(id, true);
        const info = await api.getCellfieTaskInfo(id, true);
        const download = downloads.find(({ id }) => id === downloadId);

        // Create task
        userDispatch({ type: "addTask", id: id, isImmuneSpace: true, status: "submitting", parameters: params, info: info, download: download });
        userDispatch({ type: "setActiveTask", id: id });      
        
        dataDispatch({ type: "clearOutput" });
      }
      catch (error) {
        console.log(error);

        errorDispatch({ type: "setError", error: error });
      }
    }
    else {
      try {
        const n = dataInfo.expression.numSamples;

        // Create blobs
        const dataBlob = data => {
          return new Blob([data], { type: "mimeString" });
        };

        const expressionBlob = dataBlob(rawExpressionData);
        const propertiesBlob = dataBlob(rawPropertiesData);

        // Run Cellfie
        const id = await api.runCellfie(user, expressionBlob, propertiesBlob, n, model.value.value, getParameterObject(parameters));     

        // Get task info
        const params = await api.getCellfieTaskParameters(id);
        const info = await api.getCellfieTaskInfo(id);

        // Create task
        userDispatch({ type: "addTask", id: id, isImmuneSpace: false, status: "submitting", parameters: params, info: info });
        userDispatch({ type: "setActiveTask", id: id });      
        
        dataDispatch({ type: "clearOutput" });
      }
      catch (error) {
        console.log(error);

        errorDispatch({ type: "setError", error: error });
      }
    }
*/    
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
          <Group key={ i } controlId={ parameter.name + "_select" } className="mb-3">
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
              <Button 
                variant="outline-secondary"
                onClick={ () => onParameterReset(parameter.name) }
              >
                <ArrowCounterclockwise className="d-flex align-items-center"/>
              </Button>
            </InputGroup>
          </Group>
        : parameter.range ?
          <Group key={ i } controlId={ parameter.name + "_number" } className="mb-3">
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
              <Button 
                variant="outline-secondary"
                onClick={ () => onParameterReset(parameter.name) }
              >
                <ArrowCounterclockwise className="d-flex align-items-center"/>
              </Button>
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
            <Group controlId="organism_select" className="mb-3">
              <BoldLabel>Organism</BoldLabel>
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
            <Group controlId="model_select" className="mb-3">
            <BoldLabel>Model</BoldLabel>
              <Control 
                as="select"
                value={ model.value.value }
                onChange={ onModelChange }
              >
                { model.options.map(({ name, value, disabled }, i) => (
                  <option key={ i } value={ value } disabled={ disabled }>{ name }</option>
                ))}
              </Control>
            </Group>
          </Col>
          <Col>
            <Group controlId="threshold_type_select" className="mb-3">
              <BoldLabel>{ thresholdType.name }</BoldLabel>
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
            <BoldLabel>
                <span className="text-capitalize">{ thresholdType.value }</span> 
                <> thresholding parameters</>
            </BoldLabel>
            { currentParameters }
          </Col>
        </Row>
        <Row>
          <Col>
            <Group controlId="description" className="mb-3">
              <BoldLabel>Description</BoldLabel>
              <Control 
                as="input"
                value={ description }
                onChange={ onDescriptionChange }
              />
            </Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonGroup style={{ width: "100%" }}>
              <Button 
                disabled={ !dataset }
                onClick={ onRunCellfieClick }
              >
                { !dataset ? 
                  <>No input data</>
                : <>Run CellFIE</>
                }
              </Button> 
            </ButtonGroup>
            { !dataset && 
              <div className="text-center">
                <Form.Text>Load input data</Form.Text>
              </div> 
            }
          </Col>       
        </Row>
      </Body>
    </Card>
  );
};