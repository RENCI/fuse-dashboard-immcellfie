import React, { useContext } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { DataContext, UserContext } from "../../contexts";
import { Task } from "./task";
import { api } from "../../api";
import { practiceData } from "../../datasets";

const { Header, Body } = Card;
const { Item } = ListGroup;

const sortOrder = {
  failed: 0,
  finished: 1,
  started: 2,
  queued: 3,
  submitting: 4
};

export const TaskSelection = () => {
  const [, dataDispatch  ] = useContext(DataContext);
  const [{ email, tasks }, userDispatch  ] = useContext(UserContext);

  const onTaskClick = async task => {
    userDispatch({ type: "setActiveTask", id: task.id });

    if (task.status === "finished") {      
      // XXX: Load practice input data for now
      const phenotypes = await api.loadPracticeData(practiceData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: "practice" });
      dataDispatch({ type: "setPhenotypes", data: phenotypes });

      const output = await api.getCellfieOutput(task.id);

      dataDispatch({ type: "setOutput", output: output });
    }
    else {
      // XXX: Load practice input data for now
      const phenotypes = await api.loadPracticeData(practiceData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: "practice" });
      dataDispatch({ type: "setPhenotypes", data: phenotypes });
    }
  };

  const taskDisplays = tasks.length === 0 ? 
    <Item><span>No current CellFIE tasks found for <b>{ email }</b></span></Item> :
    tasks.sort((a, b) => sortOrder[b.status] - sortOrder[a.status])
      .map((task, i) => <Task key={ i } task={ task } onClick={ onTaskClick } />);

  return (
    <Card>
      <Header as="h5">
        Select CellFIE Task
      </Header>
      <Body>
        <ListGroup variant="flush">
          { taskDisplays }
        </ListGroup>
      </Body>
    </Card>
  );
};