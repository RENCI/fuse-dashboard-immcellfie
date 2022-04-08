import { useState, useContext } from "react";
import { Modal, Form, InputGroup, OverlayTrigger, Popover, Button } from "react-bootstrap";
import { BoxArrowUpRight, QuestionCircle, PersonFill } from "react-bootstrap-icons";
import { UserContext } from "contexts";
import { SpinnerButton } from "components/spinner-button";
import { LoadNewButton } from "./load-new-button";
import style from "./load-immunespace.module.css";

const { Header, Title, Body } = Modal;
const { Group, Control, Label } = Form;

const service = "fuse-provider-immunespace";

export const LoadImmuneSpace = () => {
  const [{ user, apiKey, datasets }, userDispatch] = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [groupId, setGroupId] = useState("");

  const onShowClick = () => {
    setShow(true);
  };

  const onHideClick = () => {
    setShow(false);
  };

  const onApiKeyChange = evt => {
    setInputApiKey(evt.target.value);
  };

  const onApiKeyKeyPress = evt => {
    if (evt.key === "Enter") {
      onEnterApiKeyClick();
    }
  };

  const onGroupIdChange = evt => {
    setGroupId(evt.target.value);
  };

  const onGroupIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitGroupIdClick();
    }
  };

  const onEnterApiKeyClick = async () => {
    userDispatch({ type: "setApiKey", apiKey: inputApiKey });
  };

  const onSubmitGroupIdClick = async () => {
    userDispatch({
      type: "addDataset",
      dataset: {
        service: service,
        type: "input",
        user: user,
        apiKey: apiKey,
        accessionId: groupId
      }
    });

    setShow(false);
  };

  const apiKeys = Array.from(datasets
    .filter(({ parameters }) => parameters && parameters.apiKey)
    .reduce((apiKeys, { parameters }) => {
      apiKeys.add(parameters.apikey);

      return apiKeys;
    }, new Set()));

  return (
    <>
      <LoadNewButton 
        text='Retrieve data from ImmuneSpace'
        onClick={ onShowClick }
      />

      <Modal show={ show } onHide={ onHideClick }>
        <Header closeButton>
          <Title>
            <span className="align-middle">Retrieve new data from ImmuneSpace</span>
            <a 
              href="https://www.immunespace.org/" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <BoxArrowUpRight className="ms-2" />
            </a>
          </Title>
        </Header>
        <Body>
          <Group className="mb-3">
            <Label>
              API key 
              <OverlayTrigger
                placement="right"
                overlay={ 
                  <Popover className={ style.popoverWidth }>
                    <Popover.Header>An <b>API key</b> is necessary to access data from <b>ImmuneSpace</b></Popover.Header>
                    <Popover.Body>                        
                      <div>
                      In ImmuneSpace:
                      <ol>
                        <li><b><PersonFill className="mb-1" /></b> menu.</li>
                        <li><b>External Tool Access</b></li>
                        <li><b>Generate API Key</b></li>
                        <li><b>Copy to Clipboard</b></li>
                        <li>Paste here</li>
                      </ol>
                      </div>
                    </Popover.Body>
                  </Popover>
                }
              >
                <QuestionCircle className="ms-1 mb-1" />
              </OverlayTrigger>
            </Label>
            <InputGroup>
              <Button 
                variant="primary"
                disabled={ inputApiKey === "" || inputApiKey === apiKey }
                onClick={ onEnterApiKeyClick }
              >
                Enter
              </Button>
              <Control 
                type="text"
                list="apiKeys"
                value={ inputApiKey }
                onChange={ onApiKeyChange } 
                onKeyPress={ onApiKeyKeyPress }
              />
              <datalist id="apiKeys">
                { apiKeys.map((key, i) => 
                  <option key={ i }>{ key }</option>
                )}
              </datalist>
            </InputGroup>
            <Form.Text className="text-muted">
              { apiKey ? <>Current: { apiKey }</> : <>No current API key</> } 
            </Form.Text>
          </Group>
          <Group>
            <Label>
              Group Label
              <OverlayTrigger
                placement="right"
                overlay={ 
                  <Popover className={ style.popoverWidth }>
                    <Popover.Header>A <b>Group Label</b> is used to identify data from <b>ImmuneSpace</b></Popover.Header>
                    <Popover.Body>
                      In Immunespace:
                      <ol>
                        <li>Create a group (e.g. by applying a filter)</li>
                        <li><b>Manage Groups</b></li>
                        <li><b>Save As</b></li>
                        <li>Enter a <b>Participant Group Label</b></li>
                        <li><b>Save</b></li>
                        <li>Copy and paste the group label here</li>
                      </ol>
                    </Popover.Body>
                  </Popover>
                }
              >
                <QuestionCircle className="ms-1 mb-1" />
              </OverlayTrigger>
            </Label>
            <InputGroup>
              <SpinnerButton 
                variant="primary"
                disabled={ apiKey === "" || groupId === "" }
                spin={ false }//state === "submitting" }
                onClick={ onSubmitGroupIdClick }
              >
                Submit
              </SpinnerButton>
              <Control 
                type="text"
                value={ groupId }
                onChange={ onGroupIdChange } 
                onKeyPress={ onGroupIdKeyPress }
              />
            </InputGroup>
          </Group>  
        </Body>
      </Modal>
    </>
  );
};           