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
    if (task.active) return;

    const id = task.id;

    userDispatch({ type: "setActiveTask", id: id });
    dataDispatch({ type: "clearOutput" });

    const phenotypes = await api.getCellfiePhenotypes(id);
    const expressionData = await api.getCellfieExpressionData(id);

    dataDispatch({ type: "setDataInfo", source: "cellfie" });
    dataDispatch({ type: "setPhenotypes", data: phenotypes });
    dataDispatch({ type: "setExpressionData", data: expressionData });

    if (task.status === "finished") {  
      const output = await api.getCellfieOutput(id);

      dataDispatch({ type: "setOutput", output: output });
    }
  };

  const onDeleteClick = async task => {
    const success = await api.deleteCellfieTask(task.id);

    if (success) {
      userDispatch({ type: "removeTask", id: task.id });
    }
    else {
      // XXX: Show message?
    };
  };

  const taskDisplays = tasks.length === 0 ? 
    <Item><span>No current CellFIE tasks found for <b>{ email }</b></span></Item> :
    tasks.sort((a, b) => {
      return a.status === b.status ? 
        b.info.date_created - a.info.date_created :
        sortOrder[b.status] - sortOrder[a.status];
    }).map(task => (
      <Task 
        key={ task.id } 
        task={ task } 
        onClick={ onTaskClick }
        onDeleteClick={ onDeleteClick } 
      />
    ));

  return (
    <Card>
      <Header as="h5">
        Select CellFIE Task
      </Header>
      <Body>
        <ListGroup variant="flush" as="ul">
          { taskDisplays }
        </ListGroup>
      </Body>
    </Card>
  );
};