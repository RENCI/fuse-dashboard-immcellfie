import React, { useContext } from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { SubgroupsLink } from "../page-links";
import { OverlapVis } from "../overlap-vis";
import { subgroupColors } from "../../colors";
import "./subgroup-selection.css";

const { Header, Body } = Card;
const { Group, Label, Control } = Form;
const { color1, color2 } = subgroupColors;

export const SubgroupSelection = () => {
  const [{ subgroups, selectedSubgroups, overlapMethod }, dataDispatch] = useContext(DataContext);

  const onChange = (which, key) => {
    const subgroupKey = key === "none" ? null : +key;
    dataDispatch({ type: "selectSubgroup", which: which, key: subgroupKey });
  };

  const onOverlapMethodChange = evt => {
    dataDispatch({ type: "setOverlapMethod", method: evt.target.value });
  }

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

  const subgroup1Contained = subgroup1 && subgroup1.subjects.length === overlap;
  const subgroup2Contained = subgroup2 && subgroup2.subjects.length === overlap;

  return (
    <Card className="mt-4">
      <Header as="h5">
        <Row>
          <Col>
            Select Subgroups to Compare
          </Col>
          <Col xs="auto">
            <SubgroupsLink />
          </Col>
        </Row>
      </Header>
      <Body>        
        <Row>
          <Group as={ Col } controlId="subgroupSelect1">
            <Control 
              as="select"
              value={ value1 }
              onChange={ evt => onChange(0, evt.target.value) }
            >
              { options(1) }
            </Control>
            <div className="subgroupIndicator" style={{ borderColor: color1 }}></div>
          </Group>
          <Group as={ Col } xs="auto" className="mt-1">
            vs.
          </Group>
          <Group as={ Col } controlId="subgroupSelect2">
            <Control
              as="select"
              value={ value2 }
              disabled={ !canCompare }
              onChange={ evt => onChange(1, evt.target.value) }
            >              
              { canCompare ? options(0) : <option value="none">None</option> }
            </Control>
            <div className="subgroupIndicator" style={{ borderColor: color2 }}></div>
          </Group>
        </Row>
        { subgroup2 &&
          <Row>
            <Col>
              <OverlapVis 
                subgroup1={ subgroup1 } 
                subgroup2={ subgroup2 } 
                overlap={ overlap }
                overlapMethod={ overlapMethod } />
            </Col>
          </Row>
        }
        { overlap !== null && overlap > 0 &&
          <Row>
            <Col>                
              <Group controlId="overlapMethodSelect" className="mt-2">
                <Label>
                  <ExclamationTriangleFill className="font-weight-bold mb-1 ml-1 mr-1" />
                  Overlap: { overlap }
                </Label>
                <Control 
                  as="select"
                  value={ overlapMethod }
                  onChange={ onOverlapMethodChange }
                >              
                  <option value="both">Assign to both subgroups</option>
                  <option disabled={ subgroup1Contained || subgroup2Contained } value="neither">Assign to neither subgroup</option>
                  <option disabled={ subgroup2Contained } value="subgroup1">Assign to { subgroup1.name }</option>
                  <option disabled={ subgroup1Contained } value="subgroup2">Assign to { subgroup2.name }</option>
                </Control>
              </Group>
            </Col>
          </Row>
        }
      </Body>
    </Card>
  );
};