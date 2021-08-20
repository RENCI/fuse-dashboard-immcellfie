import React, { useContext, useState, useEffect, useRef } from "react";
import { Toast, Spinner } from "react-bootstrap";
import { CheckCircle } from "react-bootstrap-icons";
import { TaskStatusContext } from "../../contexts";

export const TaskStatus = () => {
  const [{ status }] = useContext(TaskStatusContext);
  const [time, setTime] = useState(null);
  const timer = useRef();
  
  const message = status ? status[0].toUpperCase() + status.substring(1) : null;

  const icon = status === "finished" ? <CheckCircle className="text-success ml-1" /> : 
    <Spinner animation="border" size="sm" className="ml-1" />;

  const details = status === "finished" ? "Navigate to CellFIE page to see results" :
    "Elapsed time: " + Math.floor(time / 60) + "m:" + Math.round(time % 60) + "s";

  useEffect(() => {
    if (status !== null && !timer.current) {
      const startTime = new Date();

      setTime(0);

      timer.current = setInterval(() => {
        setTime((new Date() - startTime) / 1000);
      }, 1000);    
    }
    else if (status === "finished") {
      clearInterval(timer.current);
      setTime(null);
      timer.current = null;
    }
  }, [status, timer.curent]);

  useEffect(() => () => clearInterval(timer.current), []);

  return (
    status !== null && 
    <div style={{ position: "absolute", bottom: "0px", left: "50%", transform: "translate(-50%)" }}>
      <Toast bg="info">
        <Toast.Header closeButton={ false } className="pr-5">
          <strong>CellFIE Status</strong>
        </Toast.Header>
        <Toast.Body className="pr-5">
          <div className="d-flex align-items-center">
            { message }
            { icon }
          </div>
          <div className="small text-muted mt-1">
            { details }
          </div>
        </Toast.Body>
      </Toast>
    </div>
  );
};           