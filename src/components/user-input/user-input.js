import React, { useContext, useEffect, useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import { UserContext } from "../../contexts";

const { Header, Body, Footer } = Card;
const { Group, Control } = Form;

export const UserInput = () => {
  const [{ email }, dispatch  ] = useContext(UserContext);
  const [emailEdit, setEmailEdit] = useState("");

  useEffect(() => {
    setEmailEdit(email);
  }, [email]);

  const onSubmitClick = () => {
    // XXX: Retrieve tasks

    dispatch({ type: "setEmail", email: emailEdit });
  };

  const onEmailChange = evt => {
    setEmailEdit(evt.target.value);
  };

  const onEmailKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitClick();
    }
  };

  return (
    <Card>
      <Header as="h5">
        User Input
      </Header>
      <Body>
        <h6>Email address</h6>
        <Group>  
          <InputGroup>
            <InputGroup.Prepend>
              <Button 
                variant="primary"
                disabled={ !emailEdit }
                onClick={ onSubmitClick }>
                Submit
              </Button>
            </InputGroup.Prepend>
            <Control 
              type="email"
              placeholder="Enter email"
              value={ emailEdit }
              onChange={ onEmailChange } 
              onKeyPress={ onEmailKeyPress }
            />
          </InputGroup>
        </Group>  
      </Body>
    </Card>
  );
};