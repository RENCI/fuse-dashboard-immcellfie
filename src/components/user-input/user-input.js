import { useContext, useEffect, useState, useRef } from "react";
import { Card, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { LoadingSpinner } from "components/loading-spinner";
import { DataLink } from "components/page-links";
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
  const [{ user, datasets }, userDispatch] = useContext(UserContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [userValue, setUserValue] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);
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

    userDispatch({ type: "clearUser" });
    dataDispatch({ type: "clearData" });

    try {
      // Add user if needed
      const { user, status } = await api.addUser(userValue);    

      userDispatch({ type: "setUser", user: user });
      setUserStatus(status);

      // Get datasets
      const [datasets, failed] = await api.getDatasets(user);

      // Dispatch
      userDispatch({ type: "setDatasets", datasets: datasets });

      setLoading(false);

      if (failed.length > 0) {
        errorDispatch({ type: "setError", error: (
          <>
            Failed to load { failed.length } dataset{ failed.length > 1 && "s" }:
            <pre>
              { JSON.stringify(failed, null, 2) }
            </pre>
          </>
        )});
      }     
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
                  <>Found existing user <b>{ user }</b> with { datasets.length } dataset{ datasets.length === 1 ? "" : "s" }</>
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
                <Col className="text-center">
                  <DataLink />
                </Col>
              </>
            }     
          </Row>
        </Footer>
      }
    </Card>
  );
};