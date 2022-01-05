import React, { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col, Alert } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import { UserContext, DataContext, ModelContext } from "../../contexts";
import { LoadingSpinner } from "../loading-spinner";
import { CellfieLink, InputLink } from "../page-links";
import { api } from "../../utils/api";
import { errorUtils } from "../../utils/error-utils";

const { Header, Body, Footer } = Card;
const { Group, Control, Text } = Form;
const { getErrorMessage } = errorUtils;

export const UserInput = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);
  const [, modelDispatch] = useContext(ModelContext);
  const [emailValue, setEmailValue] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedDownloads, setFailedDownloads] = useState([]);
  const [failedTasks, setFailedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
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
    setErrorMessage();
    setFailedDownloads([]);
    setFailedTasks([]);

    dataDispatch({ type: "clearData" });

    userDispatch({ type: "setEmail", email: emailValue });

    try {
      // Get ImmuneSpace downloads
      const { downloads, failed: failedDownloads } = await api.getImmuneSpaceDownloads(emailValue);
      
      downloads.sort((a, b) => b.info.date_created - a.info.date_created);

      userDispatch({ type: "setDownloads", downloads: downloads });

      // If there are downloads, set an api key
      if (downloads.length > 0) {
        userDispatch({ type: "setApiKey", apiKey: downloads[0].info.apikey })
      }

      // Get tasks
      const { tasks, failed: failedTasks } = await api.getTasks(emailValue);

      // Add downloads to tasks
      tasks.filter(task => task.isImmuneSpace).forEach(task => {
        task.download = downloads.find(({ id }) => id === task.info.immunespace_download_id);
      });

      userDispatch({ type: "setTasks", tasks: tasks });

      // Set active task
      if (tasks.length > 0) {
        const activeTask = tasks.reduce((activeTask, task) => {
          return task.status !== "failed" && task.info.date_created > activeTask.info.date_created ? task : activeTask;
        });

        const { id, isImmuneSpace } = activeTask;

        userDispatch({ type: "setActiveTask", id: id });
        modelDispatch({ type: "setParameters", parameters: activeTask.parameters });
        dataDispatch({ type: "clearOutput" });

        if (isImmuneSpace) {
          dataDispatch({ 
            type: "setDataInfo", 
            source: { name: "ImmuneSpace", downloadId: activeTask.download.id },
            phenotypes: { name: activeTask.download.info.group_id },
            expression: { name: activeTask.download.info.group_id }
          });
        }
        else {
          dataDispatch({ 
            type: "setDataInfo", 
            source: { name: "CellFIE" }
          });
        }

        const phenotypes = isImmuneSpace ? 
          await api.getImmuneSpacePhenotypes(activeTask.info.immunespace_download_id) : 
          await api.getCellfiePhenotypes(id);

        dataDispatch({ type: "setPhenotypes", data: phenotypes });

        if (!isImmuneSpace) {
          const expressionData = await api.getCellfieExpressionData(id);
          
          dataDispatch({ type: "setExpressionData", data: expressionData });
        }

        if (activeTask.status === "finished") {  
          const output = await api.getCellfieOutput(id, isImmuneSpace);

          dataDispatch({ type: "setOutput", output: output });

          // Load larger detail scoring asynchronously
          api.getCellfieDetailScoring(id, isImmuneSpace).then(result => {
            dataDispatch({ type: "setDetailScoring", data: result });
          });
        }
      }

      setLoading(false);
      setFailedDownloads(failedDownloads);
      setFailedTasks(failedTasks);
    }
    catch (error) {
      console.log(error);

      setLoading(false);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const failure = (id, type) => (
    <div key={ id } className="text-danger small">
      <ExclamationCircle className="mb-1 mr-1"/>
      Loading { type } { id } failed.
    </div>
  );

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
              <Button 
                ref={ buttonRef }
                variant="primary"                  
                type="submit"
                disabled={ !emailValid }
              >
                Submit
              </Button>
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
            { errorMessage ?
              <Col className="text-center">
                <Alert variant="danger">{ errorMessage }</Alert>
              </Col>            
            : loading ?
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
          { (failedDownloads.length > 0 || failedTasks.length > 0) &&
            <Row>
              <Col>
                <hr />
                { failedDownloads.map(({ id }) => failure(id, "download")) }
                { failedTasks.map(({ id }) => failure(id, "task")) }
              </Col>
            </Row>
          }
        </Footer>
      }
    </Card>
  );
};