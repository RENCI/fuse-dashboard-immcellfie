import { useContext, useEffect, useState, useRef } from "react";
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
  const [{ email, tasks, downloads }, userDispatch  ] = useContext(UserContext);
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

      // Get tasks
      const { tasks, failed: failedTasks } = await api.getTasks(emailValue);

      // Add downloads to tasks and vice versa
      tasks.filter(task => task.isImmuneSpace).forEach(task => {
        const download = downloads.find(({ id }) => id === task.info.immunespace_download_id);
        task.download = download;
        download.tasks.push(task);
      });

      // Dispatch
      userDispatch({ type: "setDownloads", downloads: downloads });

      // If there are downloads, set an api key
      if (downloads.length > 0) {
        userDispatch({ type: "setApiKey", apiKey: downloads[0].info.apikey })
      }

      userDispatch({ type: "setTasks", tasks: tasks });
           
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
      <ExclamationCircle className="mb-1 me-1"/>
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
            :  
              <>
                { tasks.length > 0 && 
                  <Col className="text-center">
                    <CellfieLink />
                    <div className="small text-muted">{ tasks.length } task{ tasks.length > 1 ? "s" : null } found for <b>{ email }</b></div> 
                  </Col> 
                }
                <Col className="text-center">
                  <InputLink />
                  { downloads.length > 0 && <div className="small text-muted">{ downloads.length } ImmuneSpace download{ downloads.length > 0 ? "s" : null } found for <b>{ email }</b></div> }
                </Col>
              </>
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