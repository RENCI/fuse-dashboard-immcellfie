import React, { useContext, useState, useEffect } from "react";
import { Toast, Spinner } from "react-bootstrap";
import { CheckCircle } from "react-bootstrap-icons";
import { TaskStatusContext } from "../../contexts";

export const TaskStatus = () => {
  const [{ status }] = useContext(TaskStatusContext);
  const [time, setTime] = useState();

  const message = status === "finished" ? "Finished" : 
    status === "running" ? "Running" :
    null;

  const icon = status === "finished" ? <CheckCircle className="text-success ml-1" /> : 
    status === "running" ? <Spinner animation="border" size="sm" className="ml-1" /> :
    null;

  const details = status === "finished" ? "Navigate to CellFIE page to see results" :
    status === "running" ? "Elapsed time: " + Math.floor(time / 60) + "m:" + Math.round(time % 60) + "s" :
    null;

  useEffect(() => {
    let timer;

    if (status === "running") {
      const startTime = new Date();

      setTime(0);

      timer = setInterval(() => {
        setTime((new Date() - startTime) / 1000);
      }, 1000);    
    }
    else if (status === "finished") {
      clearInterval(timer);
      setTime();
    }

    return () => clearInterval(timer);
  }, [status]);

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