import React from "react";
import { ListGroup } from "react-bootstrap";

const { Item } = ListGroup;

export const Task = ({ task, onClick }) => {
  return (
    <Item  
      key={ task.id }
      variant={ task.active ? "primary" : null }
      action
      disabled={ task.status !== "finished" }
      onClick= { () => onClick(task) }
    >
      I'm a task!
    </Item>
  );
};