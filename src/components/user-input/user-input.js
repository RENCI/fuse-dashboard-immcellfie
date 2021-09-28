import React, { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";
import { CellfieLink, InputLink } from "../page-links";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body, Footer } = Card;
const { Group, Control, Text } = Form;

export const UserInput = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);
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

    dataDispatch({ type: "clearData" });

    userDispatch({ type: "setEmail", email: emailValue });

    try {
      const tasks = await api.getCellfieTasks(emailValue);

      userDispatch({ type: "setTasks", tasks: tasks });

      let hasActive = false;

      for (const task of tasks) {
        const status = await api.checkCellfieStatus(task.id);
  
        userDispatch({ type: "setStatus", id: task.id, status: status });

        if (!hasActive && status === "finished") {        
          userDispatch({ type: "setActiveTask", id: task.id });
          hasActive = true;

          // XXX: Load practice input data for now
          const phenotypes = await api.loadPracticeData(practiceData.phenotypes);

          dataDispatch({ type: "setDataInfo", source: "practice" });
          dataDispatch({ type: "setPhenotypes", data: phenotypes });

          const output = await api.getCellfieOutput(task.id);

          dataDispatch({ type: "setOutput", output: output });
        }
      }
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