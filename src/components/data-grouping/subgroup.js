import React, { useContext } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { LabelEdit } from "./label-edit";

const { Group, Row } = Form;

export const Subgroup = ({ subgroup, index }) => {
  const [{ phenotypes }, dataDispatch] = useContext(DataContext);

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", index: index, name: name });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", index: index });
  };

  return (
    <Form>
      <Row>
        <Col>
          <LabelEdit     
            subgroup={ subgroup } 
            onChange={ index > 0 ? onNameChange : null }
          />
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={ onCloseClick }
          >
            <XCircle className="mb-1" />
          </Button>
        </Col>
      </Row>
    </Form>
  );
};           