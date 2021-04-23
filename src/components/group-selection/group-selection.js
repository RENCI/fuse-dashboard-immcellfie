import React, { useContext } from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Group, Label, Control } = Form;

export const GroupSelection = () => {
  const [{ subgroups }, dataDispatch] = useContext(DataContext);

  console.log(subgroups);

  const onChange = (subgroup, key) => {
    console.log(subgroup, key);

    console.log(subgroups.find(subgroup => subgroup.key == key));
  };

  return (
    <Card className="mt-4">
      <Body>
        <Title>Subgroup Visualization Selection</Title>
        <Row>
          <Col>
            <Label>Subgroup 1</Label>
            <Control 
              as="select"
              onChange={ evt => onChange(1, evt.target.value) }
            >
              { subgroups.map((subgroups, i) => (
                <option key={ i } value={ subgroups.key }>{ subgroups.name }</option>
              ))}
            </Control>
          </Col>
          <Col>
            <Label>Subgroup 2</Label>
            <Control 
              as="select"
              onChange={ evt => onChange(2, evt.target.value) }
            >
              <option>None</option>
              { subgroups.map((subgroups, i) => (
                <option key={ i } value={ subgroups.key }>{ subgroups.name }</option>
              ))}
            </Control>
          </Col>
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