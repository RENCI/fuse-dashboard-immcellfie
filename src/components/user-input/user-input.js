import React, { useContext, useEffect, useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import { UserContext } from "../../contexts";

const { Header, Body } = Card;
const { Group, Control, Text } = Form;

export const UserInput = () => {
  const [{ email }, dispatch  ] = useContext(UserContext);
  const [emailValue, setEmailValue] = useState("");
  const [emailValid, setEmailValid] = useState(false);

  const validateEmail = email => {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;      

    return regex.test(email);
  };

  useEffect(() => {
    setEmailValue(email);
  }, [email]);

  const onSubmitClick = () => {
    // XXX: Retrieve tasks

    dispatch({ type: "setEmail", email: emailValue });
  };

  const onEmailChange = evt => {
    setEmailValue(evt.target.value);
    setEmailValid(validateEmail(evt.target.value));
  };

  const onEmailKeyPress = evt => {
    if (emailValid && evt.key === "Enter") {
      onSubmitClick();
    }
  };

  return (
    <Card>
      <Header as="h5">
        User Input
      </Header>
      <Body>
        <h6>Email address to associate with CellFIE runs</h6>
        <Group>  
          <InputGroup>
            <InputGroup.Prepend>
              <Button 
                variant="primary"
                disabled={ !emailValid }
                onClick={ onSubmitClick }>
                Submit
              </Button>
            </InputGroup.Prepend>
            <Control 
              type="email"
              placeholder="Enter email"
              value={ emailValue }
              onChange={ onEmailChange } 
              onKeyPress={ onEmailKeyPress }
            />
          </InputGroup>
            { !emailValid && 
              <Text className="text-muted">
                Please enter a valid email address
              </Text>
            }
        </Group>  
      </Body>
    </Card>
  );
};