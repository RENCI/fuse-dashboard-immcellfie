import React, { useContext, useEffect, useReducer } from "react";
import { Badge } from "react-bootstrap";
import { DataContext, UserContext } from "../../contexts";
import { TaskStatusIcon } from "../task-status-icon";
import { api } from "../../api";

// XXX: Should move this to colors.js and use in task-status-icon
const statusColor = {
  submitting: "primary",
  queued: "info",
  started: "success"
};
     
// XXX: Create a task utils file and move there
const isActive = status => {
  return status === "submitting" || status === "queued" || status === "started";
};

export const TaskStatus = () => {
  const [, dataDispatch] = useContext(DataContext);
  const [{ tasks }, userDispatch] = useContext(UserContext);
  const [taskTimers, taskTimersDispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "add": {
        const newState = {...state};

        newState[action.id] = action.timer;

        return newState;
      }

      case "remove": {
        const newState = {...state};

        delete newState[action.id];

        return newState;
      }

      default: 
        throw new Error("Invalid taskTimers action: " + action.type);
    }
  }, {});

  useEffect(() => {
    tasks.filter(task => isActive(task.status) && !taskTimers[task.id]).forEach(task => {
      const id = task.id;
      const timer = setInterval(checkStatus, 5000);    

      checkStatus();

      taskTimersDispatch({ type: "add", id: id, timer: timer });

      async function checkStatus() {
        const status = await api.checkCellfieStatus(id);

        console.log(task.info);

        if (!task.info.start_date || !task.info.end_date) {
          const info = await api.getCellfieTaskInfo(id);

          userDispatch({ type: "setInfo", id: id, info: info });
        }

        if (status === "finished") {
          clearInterval(timer);            
          taskTimersDispatch({ type: "remove", id: id });

          userDispatch({ type: "setStatus", id: id, status: status });

          const output = await api.getCellfieOutput(id);

          dataDispatch({ type: "setOutput", output: output });
        }
        else if (status === "failed") {
          clearInterval(timer);            
          taskTimersDispatch({ type: "remove", id: id });

          userDispatch({ type: "setStatus", id: id, status: status });
        }
        else {
          userDispatch({ type: "setStatus", id: id, status: status });
        }     
      }
    });
  }, [tasks, taskTimers, dataDispatch, userDispatch]);

  const taskCounts = tasks.filter(({ status }) => isActive(status)).reduce((taskCounts, task) => {
    if (!taskCounts[task.status]) taskCounts[task.status] = 0;

    taskCounts[task.status] ++;

    return taskCounts;
  }, {});

  return (
    <div>
      { Object.entries(taskCounts).map(entry => {
        const [status, count] = entry;

        return (
          <span key={ status } className="mr-2">
            <TaskStatusIcon task={{ status: status } } />
            <Badge className={ "text-" + statusColor[status] }>{ count }</Badge>
          </span>
        );
      })}
    </div>
  );
};

/*
export const TaskStatus = () => {
  const [{ status }] = useContext(TaskStatusContext);
  const [time, setTime] = useState(null);
  const timer = useRef();
  
  const message = status ? status[0].toUpperCase() + status.substring(1) : null;

  const variant = status === "submitting" ? "primary" :
    status === "queued" ? "info" :
    "success";

  const icon = status === "finished" ? <CheckCircle className="text-success ml-1" /> : 
    <Spinner animation="border" size="sm" className="ml-1" variant={ variant } />;

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
    else if (status === "finished" || status === null) {
      clearInterval(timer.current);
      setTime(null);
      timer.current = null;
    }
  }, [status, timer.curent]);

  useEffect(() => () => clearInterval(timer.current), []);

  return (
    status !== null && 
    <div className="wrapper">
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
*/