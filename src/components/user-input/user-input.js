import React, { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { UserContext } from "../../contexts";
import { CellfieLink, InputLink } from "../page-links";
import { api } from "../../api";

const { Header, Body, Footer } = Card;
const { Group, Control, Text } = Form;

export const UserInput = () => {
  const [{ email, tasks }, dispatch  ] = useContext(UserContext);
  const [emailValue, setEmailValue] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const buttonRef = useRef();

  const validateEmail = email => {
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;      

    return regex.test(email);
  };

  useEffect(() => {
    setEmailValue(email);
  }, [email]);

  const onEmailChange = evt => {
    setEmailValue(evt.target.value);
    setEmailValid(validateEmail(evt.target.value));
  };

  const onKeyPress = evt => {
    if (emailValid && evt.key === "Enter") {
      buttonRef.current.click();
    }
  };

  const onSubmit = async evt => {
    evt.preventDefault();

    dispatch({ type: "setEmail", email: emailValue });

    try {
      const tasks = await api.getTasks(emailValue);

      dispatch({ type: "setTasks", tasks: tasks });
    }
    catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <Header as="h5">
        User Email
      </Header>
      <Body>
        <Form 
          onSubmit={ onSubmit }
          onKeyPress={ onKeyPress }
        >
          <h6>Email address to associate with CellFIE runs</h6>
          <Group>  
            <InputGroup>
              <InputGroup.Prepend>
                <Button 
                  ref={ buttonRef }
                  variant="primary"                  
                  type="submit"
                  disabled={ !emailValid }
                >
                  Submit
                </Button>
              </InputGroup.Prepend>
              <Control 
                type="email"
                name="email"
                placeholder="Enter email"
                value={ emailValue }
                onChange={ onEmailChange } 
              />
            </InputGroup>
              { !emailValid && 
                <Text className="text-muted">
                  Please enter a valid email address
                </Text>
              }
          </Group>          
        </Form>
      </Body>
      { email &&
        <Footer>
          <Row>
            { tasks.length > 0 ? 
              <>
                <Col className="text-center">
                  <CellfieLink />
                  <div className="small text-muted">{ tasks.length } task{ tasks.length > 1 ? "s" : null } found for <b>{ email }</b></div> 
                </Col>
                <Col>
                  <InputLink />
                </Col>
              </>
            :               
              <Col className="text-center">
                <InputLink />
                <div className="small text-muted">No current CellFIE tasks found for <b>{ email }</b></div>
              </Col>
            }
          </Row>
        </Footer>
      }
    </Card>
  );
};