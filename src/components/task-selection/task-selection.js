import React, { useContext } from "react";
import { Card, Form, ListGroup } from "react-bootstrap";
import { DataContext, UserContext } from "../../contexts";
import { api } from "../../api";

const { Header, Body } = Card;
const { Item } = ListGroup;

export const TaskSelection = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);

  const taskDisplays = tasks.length === 0 ? <div>No current CellFIE tasks found for <b>{ email }</b></div> :
    <ListGroup>
      { tasks.map(task => {
        return <Item>I'm a task!</Item>
      })}
    </ListGroup>

  return (
    <Card>
      <Header as="h5">
        Select CellFIE Task
      </Header>
      <Body>
        { taskDisplays }
      </Body>
    </Card>
  );
};