import React, { useContext } from "react";
import { Card, Row, Col, Form,  Alert } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { SubgroupsLink } from "../page-links";

const { Title, Body } = Card;
const { Group, Label, Control } = Form;

export const SubgroupSelection = () => {
  const [{ subgroups, selectedSubgroups }, dataDispatch] = useContext(DataContext);

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

  const overlap = selectedSubgroups[1] ? 
    selectedSubgroups[1].subjects.reduce((count, subject) => {
      if (selectedSubgroups[0].subjects.find(({ participant_id }) => {
        return participant_id === subject.participant_id;
      })) {
        count++;
      }
      
      return count;
    }, 0) :
    null;

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
              { canCompare ? options(0) : <option value="none">None</option> }
            </Control>
            { !canCompare && <SubgroupsLink /> }
          </Group>
        </Row>
        { overlap !== null && overlap > 0 &&
          <Row>
            <Col>
              <Alert variant="danger">Overlap: { overlap }</Alert>
            </Col>
          </Row>
        }
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