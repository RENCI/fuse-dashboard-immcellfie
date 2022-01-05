import React, { useState, useContext } from "react";
import { Form, InputGroup, OverlayTrigger, Popover, Button } from "react-bootstrap";
import { BoxArrowUpRight, QuestionCircle, PersonFill } from "react-bootstrap-icons";
import { UserContext, DataContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { states } from "./states";
import { api } from "../../utils/api";

const { Group, Control, Label } = Form;

export const LoadImmuneSpace = ({ state, onSetState, onError }) => {  
  const [{ email, apiKey, downloads }, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [groupId, setGroupId] = useState("");

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
    onSetState(states.submitting);
    onError();

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {
      const downloadId = await api.getImmuneSpaceDownloadId(email, groupId, apiKey);

      const timer = setInterval(checkStatus, 1000);

      async function checkStatus() {
        const status = await api.checkImmunspaceDownloadStatus(downloadId);

        if (status === "finished") {
          clearInterval(timer);

          const phenotypeData = await api.getImmuneSpacePhenotypes(downloadId);

          dataDispatch({ 
            type: "setDataInfo", 
            source: { name: "ImmuneSpace", downloadId: downloadId },
            phenotypes: { name: groupId },
            expression: { name: groupId }
          });
    
          dataDispatch({ type: "setPhenotypes", data: phenotypeData });

          onSetState(states.normal);
        }
        else if (status === "failed") {
          clearInterval(timer);
          onSetState(states.normal);
        }
      };
    }
    catch (error) {
      console.log(error);

      onError(error);
  
      onSetState(states.normal);
    }
  };

  const disabled = state !== states.normal;

  const finished = downloads.filter(({ status }) => status === "finished");

  const apiKeys = Array.from(finished.reduce((apiKeys, download) => {
    apiKeys.add(download.info.apikey);

    return apiKeys;
  }, new Set()));

  return (
    <>   
      <h6>
        Load data from ImmuneSpace 
        <a 
          href="https://www.immunespace.org/" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <BoxArrowUpRight className="ms-1 mb-1" />
        </a>
      </h6>
      <Group className="mb-3">
        <Label>
          API key 
          <OverlayTrigger
            placement="right"
            overlay={ 
              <Popover style={{ maxWidth: 500 }}>
                <Popover.Title>An <b>API key</b> is necessary to access data from <b>ImmuneSpace</b></Popover.Title>
                <Popover.Content>                        
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
                </Popover.Content>
              </Popover>
            }
          >
            <QuestionCircle className="ms-1 mb-1" />
          </OverlayTrigger>
        </Label>
        <InputGroup>
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
          <Button 
            variant="primary"
            disabled={ disabled || inputApiKey === "" || inputApiKey === apiKey }
            onClick={ onEnterApiKeyClick }
          >
            Enter
          </Button>
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
              <Popover style={{ maxWidth: 500 }}>
                <Popover.Title>A <b>Group Label</b> is used to identify data from <b>ImmuneSpace</b></Popover.Title>
                <Popover.Content>
                  In Immunespace:
                  <ol>
                    <li>Create a group (e.g. by applying a filter)</li>
                    <li><b>Manage Groups</b></li>
                    <li><b>Save As</b></li>
                    <li>Enter a <b>Participant Group Label</b></li>
                    <li><b>Save</b></li>
                    <li>Copy and paste the group label here</li>
                  </ol>
                </Popover.Content>
              </Popover>
            }
          >
            <QuestionCircle className="ms-1 mb-1" />
          </OverlayTrigger>
        </Label>
        <InputGroup>
          <Control 
            type="text"
            list="groupIds"
            value={ groupId }
            onChange={ onGroupIdChange } 
            onKeyPress={ onGroupIdKeyPress }
          />
          <datalist id="groupIds">
            { finished.map((download, i) => 
              <option key={ i }>{ download.info.group_id }</option>
            )}
          </datalist>
          <SpinnerButton 
            variant="primary"
            disabled={ disabled || apiKey === "" || groupId === "" }
            spin={ state === "submitting" }
            onClick={ onSubmitGroupIdClick }
          >
            Submit
          </SpinnerButton>
        </InputGroup>
      </Group>  
    </>  
  );
};           