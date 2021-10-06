import React, { useState, useRef, useEffect } from "react";
import { ListGroup, Row, Col, Button, Collapse } from "react-bootstrap";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { TaskStatusIcon } from "../task-status-icon";
import "./task-selection.css";

const { Item } = ListGroup;

export const Task = ({ task, onClick }) => {
  const [time, setTime] = useState(null);
  const [expand, setExpand] = useState(false);
  const timer = useRef();

  const clickable = task.status !== "failed";

  const created = task.info.date_created;
  const start = task.info.start_date;
  const end = task.info.end_date;

console.log(created, start, end, time);

  const elapsed = start && end ? (end - start) / 1000 : 
    start && time ? (time - start) / 1000 :
    null;
  const model = task.parameters.Ref.replace(".mat", "");

  const summary = (
    <>
      <small className="text-muted">
        { created.toLocaleString() }
      </small>
      <small className="text-muted ml-3">
        { Math.floor(elapsed / 60) + "m:" + Math.round(elapsed % 60) + "s" }
      </small>
      <div>{ model }</div>
    </>
  );

  useEffect(() => {
    console.log("EFFECT");

    if (start && !end && !timer.current) {
      console.log("START");
      timer.current = setInterval(() => {
        console.log("TIMEERERER");
        setTime(new Date());
      }, 1000);
    }
    else if (end && timer.current) {
      console.log("END");
      clearInterval(timer.current);
      setTime(null);
      timer.current = null;
    }
  }, [start, end]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    }
  }, [])

  const onExpandClick = evt => {
    evt.stopPropagation();

    setExpand(!expand);
  };

  return (
    <Item  
      as="li"
      key={ task.id }
      action={ clickable }
      className={ task.active ? "task-active" : null }
      onClick={ clickable ? () => onClick(task) : null }
    >
      <Row className="d-flex align-items-center">  
        <Col xs="auto" >
          <Button 
            size={ "sm "}
            variant={ "light" }
            onClick={ onExpandClick }
          >
            { expand ? <ChevronUp /> : <ChevronDown /> }
          </Button>
        </Col>      
        <Col>{ summary }</Col>
        <Col xs="auto"><TaskStatusIcon task={ task } /></Col>
      </Row>      
      <Collapse in={ expand }>
        <div>Boo!</div>
      </Collapse>
    </Item>
  );
};