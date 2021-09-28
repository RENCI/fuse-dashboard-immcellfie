import React, { useContext } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { DataContext, UserContext } from "../../contexts";
import { Task } from "./task";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body } = Card;

export const TaskSelection = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);

  const onTaskClick = async task => {
    userDispatch({ type: "setActiveTask", id: task.id });

    // XXX: Load practice input data for now
    const phenotypes = await api.loadPracticeData(practiceData.phenotypes);

    dataDispatch({ type: "setDataInfo", source: "practice" });
    dataDispatch({ type: "setPhenotypes", data: phenotypes });

    const output = await api.getCellfieOutput(task.id);

    dataDispatch({ type: "setOutput", output: output });
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