import React, { useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";

export const Home = () => {
  const [id, setId] = useState("");

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onSubmitClick = () => {
    console.log("Submit " + id);
  };

  const onLoadPracticeClick = () => {
    console.log("Load Practice");
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
            <Button 
              variant="outline-secondary"
              onClick={ onLoadPracticeClick }>
                Load practice data
            </Button>
          </Form.Group>
        </Card.Body>
      </Card>
    </>
  ); 
};