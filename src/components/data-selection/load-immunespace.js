import { useState, useContext } from "react";
import { Modal, Form, InputGroup, OverlayTrigger, Popover, Button } from "react-bootstrap";
import { BoxArrowUpRight, QuestionCircle, PersonFill, ArrowCounterclockwise } from "react-bootstrap-icons";
import { UserContext } from "contexts";
import { BoldLabel } from "components/bold-label";
import { LoadNewButton } from "./load-new-button";
import style from "./load-immunespace.module.css";

const { Header, Title, Body } = Modal;
const { Group, Control } = Form;

const service = "fuse-provider-immunespace";

export const LoadImmuneSpace = () => {
  const [{ user, apiKey, datasets }, userDispatch] = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");

  const onShowClick = () => {
    setShow(true);
  };

  const onHideClick = () => {
    setShow(false);
  };

  const onApiKeyChange = evt => {
    setInputApiKey(evt.target.value);
  };

  const onGroupIdChange = evt => {
    setGroupId(evt.target.value);
  };

  const onResetApiKeyClick = () => {
    setInputApiKey(apiKey);
  };

  const onDescriptionChange = evt => {
    setDescription(evt.target.value);
  };

  const onSubmitClick = () => {
    userDispatch({ type: "setApiKey", apiKey: inputApiKey });
    
    userDispatch({
      type: "addDataset",
      dataset: {
        service: service,
        type: "input",
        user: user,
        apiKey: inputApiKey,
        accessionId: groupId,
        description: description
      }
    });

    setShow(false);
  };

  const apiKeys = Array.from(datasets
    .filter(({ apiKey }) => apiKey)
    .reduce((apiKeys, { apiKey }) => {
      apiKeys.add(apiKey);

      return apiKeys;
    }, new Set()));

  return (
    <>
      <LoadNewButton 
        text='ImmuneSpace'
        onClick={ onShowClick }
      />

      <Modal show={ show } onHide={ onHideClick }>
        <Header closeButton>
          <Title>
            <span className="align-middle">Retrieve new ImmuneSpace dataset</span>
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
          <Group controlId="apiKey" className="mb-3">
            <BoldLabel>
              API Key 
              <OverlayTrigger
                placement="right"
                overlay={ 
                  <Popover className={ style.popoverWidth }>
                    <Popover.Header>An <b>API Key</b> is necessary to access data from <b>ImmuneSpace</b></Popover.Header>
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
            </BoldLabel>
            <InputGroup>
              <Control 
                type="text"
                list="apiKeys"
                value={ inputApiKey }
                onChange={ onApiKeyChange } 
              />
              <datalist id="apiKeys">
                { apiKeys.map((key, i) => 
                  <option key={ i }>{ key }</option>
                )}
              </datalist>
              <Button
                variant="secondary"
              >
                <ArrowCounterclockwise 
                  className="icon-offset" 
                  onClick={ onResetApiKeyClick }
                />
              </Button>
            </InputGroup>
          </Group>
          <Group controlId="groupLable" className="mb-3">
            <BoldLabel>
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
            </BoldLabel>
            <Control 
              type="text"
              value={ groupId }
              onChange={ onGroupIdChange } 
            />
          </Group>  
          <Group controlId="description" className="mb-3">
            <BoldLabel>Description (optional)</BoldLabel>
            <Control 
              as="input"
              value={ description }
              onChange={ onDescriptionChange }
            />
          </Group>
          <div className="d-grid">
            <Button
              variant="primary"
              disabled={ inputApiKey === "" || groupId === "" }
              onClick={ onSubmitClick }
            >
              Submit
            </Button>  
          </div>
        </Body>
      </Modal>
    </>
  );
};           