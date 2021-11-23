import React, { useContext } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { DataContext, UserContext, ModelContext } from "../../contexts";
import { Task } from "./task";
import { api } from "../../utils/api";

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
  const [, modelDispatch] = useContext(ModelContext);

  const selectTask = async task => {
    try {
      const { id, isImmuneSpace } = task;

      userDispatch({ type: "setActiveTask", id: id });
      modelDispatch({ type: "setParameters", parameters: task.parameters });
      dataDispatch({ type: "clearOutput" });

      if (isImmuneSpace) {
        dataDispatch({ 
          type: "setDataInfo", 
          source: { name: "ImmuneSpace", downloadId: task.download.id },
          phenotypes: { name: task.download.info.group_id },
          expression: { name: task.download.info.group_id }
        });
      }
      else {
        dataDispatch({ 
          type: "setDataInfo", 
          source: { name: "CellFIE" }
        });
      }

      const phenotypes = isImmuneSpace ? 
        await api.getImmuneSpacePhenotypes(task.info.immunespace_download_id) : 
        await api.getCellfiePhenotypes(id);

      dataDispatch({ type: "setPhenotypes", data: phenotypes });

      if (!isImmuneSpace) {
        const expressionData = await api.getCellfieExpressionData(id);
        
        dataDispatch({ type: "setExpressionData", data: expressionData });
      }

      if (task.status === "finished") {  
        const output = await api.getCellfieOutput(id, isImmuneSpace);

        dataDispatch({ type: "setOutput", output: output });

        // Load larger detail scoring asynchronously
        api.getCellfieDetailScoring(id, isImmuneSpace).then(result => {
          dataDispatch({ type: "setDetailScoring", data: result });
        });
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  const onTaskClick = async task => {
    if (task.active) return;

    selectTask(task);
  };

  const onDeleteClick = async task => {
    const success = await api.deleteCellfieTask(task.id, task.isImmuneSpace);

    if (success) {
      userDispatch({ type: "removeTask", id: task.id });

      // Set active task if necessary
      if (task.active && tasks.length > 1) {
        const activeTask = tasks.filter(({ id }) => id !== task.id).reduce((activeTask, task) => {
          return task.status !== "failed" && task.info.date_created > activeTask.info.date_created ? task : activeTask;
        });

        selectTask(activeTask);
      }
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