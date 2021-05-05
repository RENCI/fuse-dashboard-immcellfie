import React, { useContext } from "react";
import { Card, Row, Col, Form,  Alert } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
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
        disabled={ selectedSubgroups[other] === subgroup.key}
      >
        { subgroup.name }
      </option>
    ));
  };

  const getSubgroup = key => key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;

  const subgroup1 = getSubgroup(selectedSubgroups[0]);
  const subgroup2 = getSubgroup(selectedSubgroups[1]);

  const value1 = subgroup1 ? subgroup1.key : "";
  const value2 = subgroup2 ? subgroup2.key : "none";
  
  const canCompare = subgroups.length > 1;

  const overlap = subgroup1 && subgroup2 ? 
    subgroup2.subjects.reduce((count, subject) => {
      if (subgroup1.subjects.find(({ participant_id }) => {
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
            <Label>Subgroup A</Label>
            <Control 
              as="select"
              value={ value1 }
              onChange={ evt => onChange(0, evt.target.value) }
            >
              { options(1) }
            </Control>
          </Group>
          <Group as={ Col } controlId="subgroupSelect2">
            <Label>Subgroup B</Label>
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
              <Alert variant="danger">
                <ExclamationCircle className="mb-1 mr-2"/>
                Overlap: { overlap }
              </Alert>
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