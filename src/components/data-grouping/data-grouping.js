import React, { useState, useContext } from "react";
import { Card, Form } from "react-bootstrap";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Label, Group, Switch } = Form;

export const DataGrouping = () => {
  const [data, dataDispatch] = useContext(DataContext);
  const [groupData, setGroupData] = useState(false);

  const onGroupChange = evt => {
    //setId(evt.target.value);
    console.log(evt.target.checked);

    console.log(data);
  };

  return (
    <Card>
      <Body>
        <Title>Data Grouping</Title>
        <Group controlId="groupSwitch">
          <Label><small>Group data</small></Label>
          <Switch onChange={ onGroupChange } />
        </Group>
      </Body>
    </Card>
  );
};           