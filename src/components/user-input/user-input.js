import React, { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { UserContext, DataContext, ModelContext } from "../../contexts";
import { LoadingSpinner } from "../loading-spinner";
import { CellfieLink, InputLink } from "../page-links";
import { api } from "../../utils/api";
import { taskUtils } from "../../utils/task-utils";

const { Header, Body, Footer } = Card;
const { Group, Control, Text } = Form;
const { isImmuneSpace } = taskUtils;

export const UserInput = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);
  const [, modelDispatch] = useContext(ModelContext);
  const [emailValue, setEmailValue] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef();

  const validateEmail = email => {
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;      

    return regex.test(email);
  };

  useEffect(() => {
    setEmailValue(email);
    setEmailValid(validateEmail(email));
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

    setLoading(true);

    dataDispatch({ type: "clearData" });

    userDispatch({ type: "setEmail", email: emailValue });

    try {
      const downloads = await api.getImmuneSpaceDownloads(emailValue);
      
      userDispatch({ type: "setDownloads", downloads: downloads });

      const tasks = await api.getTasks(emailValue);

      userDispatch({ type: "setTasks", tasks: tasks });

      // Set active task
      if (tasks.length > 0) {
        const activeTask = tasks.reduce((activeTask, task) => {
          return task.status !== "failed" && task.info.date_created > activeTask.info.date_created ? task : activeTask;
        });

        const id = activeTask.id;
        const immuneSpace = isImmuneSpace(activeTask);

        userDispatch({ type: "setActiveTask", id: id });
        modelDispatch({ type: "setParameters", parameters: activeTask.parameters });

        const phenotypes = immuneSpace ? 
          await api.getImmuneSpacePhenotypes(activeTask.info.immunespace_download_id) : 
          await api.getCellfiePhenotypes(id);


        // XXX: Need to get expression data if not immunespace


        //const expressionData = await api.getCellfieExpressionData(id);

        dataDispatch({ type: "setDataInfo", source: { name: "CellFIE" }});
        dataDispatch({ type: "setPhenotypes", data: phenotypes });
        //dataDispatch({ type: "setExpressionData", data: expressionData });

        if (activeTask.status === "finished") {  
          const output = await api.getCellfieOutput(id, immuneSpace);

          dataDispatch({ type: "setOutput", output: output });

          // Load larger detail scoring asynchronously
          api.getCellfieDetailScoring(id, immuneSpace).then(result => {
            dataDispatch({ type: "setDetailScoring", data: result });
          });
        }
      }

      setLoading(false);
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
          <h6>Email address for CellFIE tasks</h6>
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
            { loading ?
              <Col className="text-center">
                <LoadingSpinner />
              </Col>
            : tasks.length > 0 ? 
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