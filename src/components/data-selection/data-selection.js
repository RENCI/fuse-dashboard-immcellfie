import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Card, Form, InputGroup, Alert, Row, Col, Button } from "react-bootstrap";
import { Diagram3, Columns, Table } from "react-bootstrap-icons";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { api } from "../../api";

const { Title, Body } = Card;
const { Label, Group, Control, Text } = Form;

export const DataSelection = ({ inputName, phenotypeName }) => {
  const history = useHistory();
  const [{ phenotypes }, dataDispatch] = useContext(DataContext);
  const [id, setId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitClick();
    }
  };

  const onSubmitClick = () => {
    setSubmitting(true);

    dataDispatch({ type: "clearData" });

    setTimeout(() => {
      setSubmitting(false);
      setMessage(<>Submitting ID <strong>{ id }</strong> failed</>);
    }, 1000);
  };

  const onLoadPracticeClick = async () => {
    setLoading(true);
    setMessage();

    dataDispatch({ type: "clearData" });

    const input = await api.loadPracticeData(inputName);
    const phenotypes = await api.loadPracticeData(phenotypeName);

    dataDispatch({ type: "setInput", file: input });
    dataDispatch({ type: "setPhenotypes", file: phenotypes });

    setLoading(false);
    setMessage("Practice input data loaded");
  };

  const disabled = loading || submitting;

  return (
    <Card>
      <Body>
        <Title>Data Selection</Title>
        <Group>        
          <Label>
            Load ImmuneSpace dataset ID
          </Label>
          <InputGroup>
            <InputGroup.Prepend>
              <SpinnerButton 
                variant="primary"
                disabled={ disabled || id === "" }
                spin={ submitting }
                onClick={ onSubmitClick }>
                Submit
              </SpinnerButton>
            </InputGroup.Prepend>
            <Control 
              type="text"
              value={ id }
              onChange={ onIdChange } 
              onKeyPress={ onIdKeyPress }
            />
          </InputGroup>
        </Group>
        <Group>
          <Text>OR</Text>
        </Group>
        <Group>   
          <SpinnerButton 
            variant="outline-secondary"
            disabled={ disabled }
            spin={ loading }
            onClick={ onLoadPracticeClick }
          >
            Load practice data
          </SpinnerButton>
        </Group>
        { message && 
          <Group>  
            <Alert variant="info">{ message }</Alert>
          </Group>  
        }
        { phenotypes &&
          <Row>
            <Col>
              <Button 
                variant="link" 
                block
                onClick={ () => history.push("/create-subgroups") }
              >
                <Diagram3 className="mr-2 mb-1"/>Create subgroups
              </Button>
            </Col>
            <Col>
              <Button 
                variant="link" 
                block
                onClick={ () => history.push("/run-cellfie") }
              >
                <Columns className="mr-2 mb-1"/>Run CellFIE
              </Button>
            </Col>
            <Col>
              <Button 
                variant="link" 
                block
                onClick={ () => history.push("/expression-data") }
              >
                <Table className="mr-2 mb-1"/>Load expression data
              </Button>
            </Col>
          </Row>
        }
      </Body>
    </Card>
  );
};           