import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Alert, Row, Col } from "react-bootstrap";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { api } from "../../api";

const { Header, Body, Footer } = Card;
const { Label, Group, Control, Text } = Form;

export const DataSelection = ({ phenotypeName }) => {
  const [{ phenotypeData }, dataDispatch] = useContext(DataContext);
  const [id, setId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const onIdChange = evt => {
    setId(evt.target.value);
  };

  const onIdKeyPress = evt => {
    if (evt.key === "Enter") {
      onSubmitClick();
    }
  };

  const onSubmitClick = () => {
    setSubmitting(true);

    dataDispatch({ type: "clearData" });

    setTimeout(() => {
      setSubmitting(false);
      setMessage(<>Submitting ID <strong>{ id }</strong> failed</>);
    }, 1000);
  };

  const onLoadPracticeClick = async () => {
    setLoading(true);
    setMessage();

    dataDispatch({ type: "clearData" });

    const data = await api.loadPracticeData(phenotypeName);

    dataDispatch({ type: "setPhenotypes", file: data });

    setLoading(false);
    setMessage("Practice data loaded");
  };

  const disabled = loading || submitting;

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <Group>        
          <Label>
            Load ImmuneSpace dataset ID
          </Label>
          <InputGroup>
            <InputGroup.Prepend>
              <SpinnerButton 
                variant="primary"
                disabled={ disabled || id === "" }
                spin={ submitting }
                onClick={ onSubmitClick }>
                Submit
              </SpinnerButton>
            </InputGroup.Prepend>
            <Control 
              type="text"
              value={ id }
              onChange={ onIdChange } 
              onKeyPress={ onIdKeyPress }
            />
          </InputGroup>
        </Group>
        <Group>
          <Text>OR</Text>
        </Group>
        <Group>   
          <SpinnerButton 
            variant="outline-secondary"
            disabled={ disabled }
            spin={ loading }
            onClick={ onLoadPracticeClick }
          >
            Load practice data
          </SpinnerButton>
        </Group>
        { message && 
          <Group>  
            <Alert variant="info">{ message }</Alert>
          </Group>  
        }
      </Body>
      { phenotypeData &&
        <Footer>
          <Row>
            <Col className="text-center">
              <CellfieLink />
            </Col>
            <Col className="text-center">
              <SubgroupsLink />
            </Col>
            <Col className="text-center">
              <ExpressionLink />
            </Col>
          </Row>
        </Footer>
      }
    </Card>
  );
};           