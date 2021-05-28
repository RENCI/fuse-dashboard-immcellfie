import React, { useState, useContext } from "react";
import { Card, Form, InputGroup, Alert, Row, Col } from "react-bootstrap";
import { SpinnerButton } from "../spinner-button";
import { DataContext } from "../../contexts";
import { PhenotypeInfo } from "../phenotype-info";
import { ExpressionInfo } from "../expression-info";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { api } from "../../api";

const { Header, Body, Footer } = Card;
const { Label, Group, Control, Text, File } = Form;

export const DataSelection = ({ phenotypeName }) => {
  const [{ phenotypeData, input }, dataDispatch] = useContext(DataContext);
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

    dataDispatch({ type: "clearData" });

    const data = await api.loadPracticeData(phenotypeName);

    dataDispatch({ type: "setPhenotypes", file: data });

    setLoading(false);
  };

  const onFileUpload = async evt => {
    if (evt.target.files.length === 1) {
      setLoading(true);

      dataDispatch({ type: "clearData" });

      const data = await api.loadFile(evt.target.files[0]);

      dataDispatch({ type: "setPhenotypes", file: data });

      setLoading(false);
    }
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
          <File
            label="Upload phenotype data"
            custom        
            onChange={ onFileUpload }
          />
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
        <Row className="row-eq-height">
          <Col>
            { phenotypeData && <PhenotypeInfo data={ phenotypeData } /> }
          </Col>
          <Col>
            { input && <ExpressionInfo data={ input } /> }
          </Col>
        </Row>
        { message && <Alert variant="info">{ message }</Alert> }
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