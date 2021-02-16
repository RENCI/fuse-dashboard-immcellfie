import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Button, Alert } from "react-bootstrap";
import { SpinnerButton } from "../components/spinner-button"
import { DataContext } from "../contexts";
import { api } from "../api";

export const Home = () => {
  const [, dataDispatch] = useContext(DataContext);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onSubmitClick = () => {
    console.log("Submit " + id);
  };

  const onLoadPracticeClick = async () => {
    setLoading(true);

    const [input, output] = await api.loadPracticeData(); 

    dataDispatch({ type: "setInput", data: input });
    dataDispatch({ type: "setOutput", data: output });

    setLoading(false);
    setMessage("Practice data loaded");
  };

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
                <Button onClick={ onSubmitClick }>
                  Submit
                </Button>
              </InputGroup.Prepend>
              <Form.Control 
                type="text"
                value={ id }
                onChange={ onIdChange } 
              />
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Text>OR</Form.Text>
          </Form.Group>
          <Form.Group>   
            <SpinnerButton 
              variant="outline-secondary"
              spin={ loading }
              onClick={ onLoadPracticeClick }>
                Load practice data
            </SpinnerButton>
          </Form.Group>
          { message && 
            <Form.Group>  
              <Alert variant="primary">{ message }</Alert>
            </Form.Group>  
          }
        </Card.Body>
      </Card>
    </>
  ); 
};