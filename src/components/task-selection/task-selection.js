import React, { useContext } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { DataContext, UserContext } from "../../contexts";
import { Task } from "./task";
import { api } from "../../api";

const { Header, Body } = Card;

export const TaskSelection = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);

  const onTaskClick = task => {
    userDispatch({ type: "setActiveTask", id: task.id });
  };

  const taskDisplays = tasks.length === 0 ? <div>No current CellFIE tasks found for <b>{ email }</b></div> :
    <ListGroup>
      { tasks.map(task => <Task task={ task } onClick={ onTaskClick } />) }
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