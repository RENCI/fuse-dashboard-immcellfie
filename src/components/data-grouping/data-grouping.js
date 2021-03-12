import React, { useState, useContext } from "react";
import { Card, Form } from "react-bootstrap";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Label, Group, Switch } = Form;

export const DataGrouping = () => {
  const [{ output, groups }, dataDispatch] = useContext(DataContext);

  const onGroupChange = evt => {
    if (evt.target.checked) {
      // Just split in two for now
      const groups = output && output.tasks.length > 0 ? 
        output.tasks[0].scores.map((score, i, a) => {
          return i < a.length / 2 ? "A" : "B";
        }) : null;

      dataDispatch({ type: "setGroups", groups: groups });
    }
    else {
      dataDispatch({ type: "setGroups", groups: null });
    }
  };

  return (
    <Card>
      <Body>
        <Title>Data Grouping</Title>
        <Group controlId="groupSwitch">
          <Label><small>Group data</small></Label>
          <Switch 
            checked={ groups !== null }
            onChange={ onGroupChange } />
        </Group>
      </Body>
    </Card>
  );
};           