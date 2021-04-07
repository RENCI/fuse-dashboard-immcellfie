import React, { useState, useContext } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Label, Group, Switch, Control } = Form;

const excludedPhenotypes = [
  "participant_id",
  "biosample_accession"
];

const timeSort = {
  Hours: 0,
  Days: 1,
  Months: 2,
  Years: 3
};

export const DataGrouping = () => {
  const [{ output, phenotypes, groups }, dataDispatch] = useContext(DataContext);

  console.log(phenotypes);

  const onGroupChange = evt => {
    if (evt.target.checked) {
      // Just split in two for now
      const groups = output && output.tasks.length > 0 ? 
        output.tasks[0].scores.map((score, i, a) => {
          const number = i < a.length / 2 ? 0 : 1;

          return {
            number: number,
            name: number === 0 ? "A" : "B"
          };
        }) : null;

      dataDispatch({ type: "setGroups", groups: groups });
    }
    else {
      dataDispatch({ type: "setGroups", groups: null });
    }
  };

  const phenotypeValues = !phenotypes ? [] :
    phenotypes.columns
      .filter(column => !excludedPhenotypes.includes(column))
      .map(column => {
        const values = Array.from(phenotypes.reduce((values, row) => {
          values.add(row[column]);
          return values;
        }, new Set()));

        const numeric = values.reduce((numeric, value) => numeric && !isNaN(value), true);

        if (numeric) {
          values.forEach((value, i, values) => values[i] = +values[i]);
          values.sort((a, b) => a - b);
        }
        else if (column === "study_time_collected_unit") {
          values.sort((a, b) => timeSort[a] - timeSort[b]);
        }
        else {
          values.sort();
        }

        return {
          name: column,
          values: values
        };
      });

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const groupControls = group => {
    return phenotypeValues.map((phenotype, i) => (
      <Group key={ i } controlId={ phenotype.name + "_" + group + "_select" }>
        <Label><small className="capitalize">{ nameLabel(phenotype.name) }</small></Label>
        <Control 
          as="select"
          size="sm"
          className="border-success"
        >
          <option>Any</option>
          <option disabled>──────────</option>
          { phenotype.values.map((value, i) => (
            <option key={ i }>{ value }</option>
          ))}
        </Control>
      </Group>
    ));
  };

  return (
    <Card>
      <Body>
        <Title>Data Grouping</Title>
        <Row>
          <Col>
            <h6>Group 1</h6>
            { groupControls("1") }
          </Col>
          <Col>
            <h6>Group 2</h6>
            { groupControls("2") }
          </Col>
        </Row>
      </Body>
    </Card>
  );
};           