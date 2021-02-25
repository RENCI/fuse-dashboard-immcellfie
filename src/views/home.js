import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Alert } from "react-bootstrap";
import { SpinnerButton } from "../components/spinner-button"
import { DataContext } from "../contexts";
import { api } from "../api";

const practiceData = {
  input: "HPA.tsv",
  output: "HPA.expected",
  outputType: "tsv"
  //output: "ASD.output",
  //output: "TD.output",
  //outputType: "csv"
};

export const Home = () => {
  const [, dataDispatch] = useContext(DataContext);
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

    setTimeout(() => {
      setSubmitting(false);
      setMessage(<>Submitting ID <strong>{ id }</strong> failed</>);
    }, 1000);
  };

  const onLoadPracticeClick = async () => {
    setLoading(true);

    const [input, output] = await api.loadPracticeData(practiceData.input, practiceData.output);

    dataDispatch({ type: "setInput", file: input });
    dataDispatch({ type: "setOutput", file: output, fileType: practiceData.outputType });

    setLoading(false);
    setMessage("Practice data loaded");
  };

  const disabled = loading || submitting;

  return (    
    <>
      <Card>
        <Card.Body>
          <Form.Group>        
            <Form.Label>
              Load ImmuneSpace dataset ID
            </Form.Label>
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
              <Form.Control 
                type="text"
                value={ id }
                onChange={ onIdChange } 
                onKeyPress={ onIdKeyPress }
              />
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Text>OR</Form.Text>
          </Form.Group>
          <Form.Group>   
            <SpinnerButton 
              variant="outline-secondary"
              disabled={ disabled }
              spin={ loading }
              onClick={ onLoadPracticeClick }>
                Load practice data
            </SpinnerButton>
          </Form.Group>
          { message && 
            <Form.Group>  
              <Alert variant="info">{ message }</Alert>
            </Form.Group>  
          }
        </Card.Body>
      </Card>
    </>
  ); 
};