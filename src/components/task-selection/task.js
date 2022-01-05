import React, { useState, useRef, useEffect } from "react";
import { ListGroup, Row, Col, Button, Collapse, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ChevronDown, ChevronUp, XLg } from "react-bootstrap-icons";
import { TaskStatusIcon } from "../task-status-icon";
import { getModel } from "../../utils/models";
import "./task-selection.css";

const { Item } = ListGroup;

const timeString = milliseconds => {
  if (milliseconds < 0) return "-:--";

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

  const created = task.info.date_created;
  const start = task.info.start_date;
  const end = task.info.end_date;

  const elapsed = start && end ? (end - start) : 
    start && time ? (time - start) :
    -1;

  const model = getModel(task.parameters.Ref);

  const modelName = model ? model.name : "";
  const organism = model ? model.organism : "";

  const summary = (
    <>
      <Row>
        <Col>
          <small className="text-muted">
            { created.toLocaleString() }
            </small>
        </Col>
        <Col>
          <small className="text-muted">
            { organism }: { modelName }
          </small>
        </Col>
      </Row>
      <div>          
        { task.download ? 
          `ImmuneSpace: ${ task.download.info.group_id }` :
          "uploaded data" 
        }
      </div>
    </>
  );

  useEffect(() => {
    if (task.status !== "failed" && start && !end && !timer.current) {
      timer.current = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }
    else if ((task.status === "failed" || end) && timer.current) {
      clearInterval(timer.current);
      setTime(null);
      timer.current = null;
    }
  }, [task.status, start, end]);

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
      className={ task.active ? "task-active" : null }
      onClick={ () => onClick(task) }
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
        <Col xs="auto" className="text-end">
          <TaskStatusIcon task={ task } />
          { task.status !== "failed" && 
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