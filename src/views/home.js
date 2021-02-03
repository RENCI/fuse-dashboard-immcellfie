<<<<<<< HEAD
import React, { useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";

export const Home = () => {
=======
import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import { DataContext } from "../contexts";
import { api } from "../api";

export const Home = () => {
  const [, dataDispatch] = useContext(DataContext);
>>>>>>> 67a8191e38606aeb01cdbc03ff46557357ef2c35
  const [id, setId] = useState("");

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onSubmitClick = () => {
    console.log("Submit " + id);
  };

<<<<<<< HEAD
  const onLoadPracticeClick = () => {
    console.log("Load Practice");
=======
  const onLoadPracticeClick = async () => {
    const [input, output] = await api.loadPracticeData(); 

    dataDispatch({ type: "setInput", data: input });
    dataDispatch({ type: "setOutput", data: output });
>>>>>>> 67a8191e38606aeb01cdbc03ff46557357ef2c35
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