import React, { useState, useRef, useEffect } from "react";
import { ListGroup, Row, Col, Button, Collapse, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ChevronDown, ChevronUp, XLg } from "react-bootstrap-icons";
import { TaskStatusIcon } from "../task-status-icon";
import "./task-selection.css";

const { Item } = ListGroup;

const timeString = milliseconds => {
  const seconds = milliseconds / 1000;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);

  return m + ":" + (s < 10 ? "0" : "") + s;
};

const objectDisplay = object => (
  <small className="text-muted">
    { Object.entries(object).map(([key, value]) => (
      <div key={ key }>{ key }: { !value ? "missing" : value.toLocaleString ? value.toLocaleString() : value }</div>
    )) }
  </small>
);

export const Task = ({ task, onClick, onDeleteClick }) => {
  const [time, setTime] = useState(null);
  const [expand, setExpand] = useState(false);
  const timer = useRef();

  const clickable = task.status !== "failed";

  const created = task.info.date_created;
  const start = task.info.start_date;
  const end = task.info.end_date;

  const elapsed = start && end ? (end - start) : 
    start && time ? (time - start) :
    null;

  // XXX: Move organism/model options to separate file so we can use here and in model selection
  const model = task.parameters.Ref.replace(".mat", "");

  const summary = (
    <>
      <small className="text-muted">
        { created.toLocaleString() }
      </small>
      <div>{ model }</div>
    </>
  );

  useEffect(() => {
    if (start && !end && !timer.current) {
      timer.current = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }
    else if (end && timer.current) {
      clearInterval(timer.current);
      setTime(null);
      timer.current = null;
    }
  }, [start, end]);

  useEffect(() => {
    // Clean up timer
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

  const onDeleteButtonClick = evt => {
    evt.stopPropagation();

    onDeleteClick(task);
  }

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
        <Col xs="auto" className="text-right">
          <TaskStatusIcon task={ task } />
          { elapsed && 
            <div className="text-muted small">
              { timeString(elapsed) }
            </div>
          }
        </Col>
      </Row>      
      <Collapse in={ expand }>
        <div>
          <Row className="mt-3 border-top pt-3">
            <Col>
              { objectDisplay(task.info) }              
            </Col>
            <Col>
              { objectDisplay(task.parameters) }
            </Col>
            <Col xs="auto">
              <OverlayTrigger
                overlay={
                  <Tooltip>
                    Delete task
                  </Tooltip>
                }
              >
                <Button 
                  size={ "sm"}
                  variant={ "outline-danger" }
                  onClick={ onDeleteButtonClick }
                >
                  <XLg className="mb-1" />
                </Button>                
              </OverlayTrigger>
            </Col>
          </Row>
        </div>
      </Collapse>
    </Item>
  );
};