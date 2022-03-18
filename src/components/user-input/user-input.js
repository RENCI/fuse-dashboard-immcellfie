import { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { LoadingSpinner } from "components/loading-spinner";
import { CellfieLink, InputLink } from "components/page-links";
import { api } from "utils/api";

const { Header, Body, Footer } = Card;
const { Group, Control, Text } = Form;

const validateEmail = email => {
  // Taken from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;      

  return regex.test(email);
};

export const UserInput = () => {
  const [, dataDispatch] = useContext(DataContext);
  const [{ user, tasks, downloads }, userDispatch] = useContext(UserContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [userValue, setUserValue] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failedDownloads, setFailedDownloads] = useState([]);
  const [failedTasks, setFailedTasks] = useState([]);
  const buttonRef = useRef();

  useEffect(() => {
    setUserValue(user);
    setValidEmail(validateEmail(user));
  }, [user]);

  const onUserChange = evt => {
    const value = evt.target.value;
    setUserValue(value);    
    setValidEmail(validateEmail(value));
    setUserStatus(null);
  };

  const onSubmit = async evt => {
    evt.preventDefault();

    setLoading(true);
    setFailedDownloads([]);
    setFailedTasks([]);

    userDispatch({ type: "clearUser" });
    dataDispatch({ type: "clearData" });

    try {
      // Add user if needed
      const { user, status } = await api.addUser(userValue);    

      userDispatch({ type: "setUser", user: user });
      setUserStatus(status);

      // Get datasets
      const datasets = await api.getDatasets(user);

      // Dispatch
      userDispatch({ type: "setDatasets", datasets: datasets });

      setLoading(false);
/*      
      // Get ImmuneSpace downloads
      const { downloads, failed: failedDownloads } = await api.getImmuneSpaceDownloads(userValue);
      
      downloads.sort((a, b) => b.info.date_created - a.info.date_created);

      // Get tasks
      const { tasks, failed: failedTasks } = await api.getTasks(userValue);

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
*/      
    }
    catch (error) {
      console.log(error);

      setLoading(false);
      errorDispatch({ type: "setError", error: error });
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
        User Name
      </Header>
      <Body>
        <Form onSubmit={ onSubmit }>
          <h6>Input new or existing user name</h6>
          <Group>  
            <InputGroup>
              <Button 
                ref={ buttonRef }
                variant="primary"                  
                type="submit"
                disabled={ !validEmail }
              >
                Submit
              </Button>
              <Control 
                name="user"
                placeholder="Enter user name"
                value={ userValue }
                onChange={ onUserChange } 
              />
            </InputGroup>
            { !validEmail && 
              <Text className="text-muted">
                User name must be a valid email address
              </Text>
            }
            { userStatus && 
              <Text className="text-muted">
                { userStatus === "existed" ? 
                  <>Found existing user <b>{ user }</b></>
                :
                  <>Added new user <b>{ user }</b></>
                }
              </Text>
            }
          </Group>          
        </Form>
      </Body>
      { user &&
        <Footer>
          <Row>
            { loading ?
              <Col className="text-center">
                <LoadingSpinner />
              </Col>
            :  
              <>
                { tasks.length > 0 && 
                  <Col className="text-center">
                    <CellfieLink />
                    <div className="small text-muted">{ tasks.length } task{ tasks.length > 1 ? "s" : null } found for <b>{ user }</b></div> 
                  </Col> 
                }
                <Col className="text-center">
                  <InputLink />
                  { downloads.length > 0 && <div className="small text-muted">{ downloads.length } ImmuneSpace download{ downloads.length > 0 ? "s" : null } found for <b>{ user }</b></div> }
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