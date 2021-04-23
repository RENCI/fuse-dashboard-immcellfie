import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { Diagram3 } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Group, Label, Control } = Form;

export const SubgroupSelection = () => {
  const history = useHistory();
  const [{ subgroups, selectedSubgroups }, dataDispatch] = useContext(DataContext);

  console.log(subgroups);
  console.log(selectedSubgroups);

  const onChange = (which, key) => {
    const subgroupKey = key === "none" ? null : +key;
    dataDispatch({ type: "selectSubgroup", which: which, key: subgroupKey });
  };

  const options = other => {
    return subgroups.map((subgroup, i) => (
      <option 
        key={ i } 
        value={ subgroup.key }
        disabled={ selectedSubgroups[other] && selectedSubgroups[other].key === subgroup.key}
      >
        { subgroup.name }
      </option>
    ));
  };

  const value1 = selectedSubgroups[0] ? selectedSubgroups[0].key : "";
  const value2 = selectedSubgroups[1] ? selectedSubgroups[1].key : "none";
  
  const canCompare = subgroups.length > 1;

  return (
    <Card className="mt-4">
      <Body>
        <Title>Select Subgroups to Compare</Title>
        <Row>
          <Group as={ Col } controlId="subgroupSelect1">
            <Label>Subgroup 1</Label>
            <Control 
              as="select"
              value={ value1 }
              onChange={ evt => onChange(0, evt.target.value) }
            >
              { options(1) }
            </Control>
          </Group>
          <Group as={ Col } controlId="subgroupSelect2">
            <Label>Subgroup 2</Label>
            <Control 
              as="select"
              value={ value2 }
              disabled={ !canCompare }
              onChange={ evt => onChange(1, evt.target.value) }
            >
              <option value="none">None</option>
              { options(0) }
            </Control>
            { !canCompare && 
              <Button 
                variant="link" 
                onClick={ () => history.push("/subgroups") }
              >
                <Diagram3 className="mr-2 mb-1"/>Create subgroups
              </Button>
            }
          </Group>
        </Row>
      </Body>
    </Card>
  );
};           

/*
            { message && 
              <Group>  
               <Alert variant="info">{ message }</Alert>
              </Group>  
            }
*/