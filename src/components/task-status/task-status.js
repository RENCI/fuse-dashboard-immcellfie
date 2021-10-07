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

  // Set active task
  useEffect(() => {
    const activeTask = tasks.find(({ active }) => active);

    if (!activeTask && tasks.length > 0) {
      const task = tasks.reduce((activeTask, task) => {
        return task.status !== "failed" && task.info.date_created > activeTask.info.date_created ? task : activeTask;
      });

      userDispatch({ type: "setActiveTask", id: task.id });
    }
  }, [tasks]);

  // Check status and info
  useEffect(() => {
    tasks.filter(task => isActive(task.status) && !taskTimers[task.id]).forEach(task => {
      const id = task.id;
      const timer = setInterval(checkStatus, 1000);    

      taskTimersDispatch({ type: "add", id: id, timer: timer });

      checkStatus();

      async function checkStatus() {
        if (!task.info.start_date || !task.info.end_date) {
          const info = await api.getCellfieTaskInfo(id);

          userDispatch({ type: "setInfo", id: id, info: info });
        }

        const status = await api.checkCellfieStatus(id);

        if (status === "finished") {
          clearInterval(timer);            
          taskTimersDispatch({ type: "remove", id: id });

          userDispatch({ type: "setStatus", id: id, status: status });

          if (task.active) {
            const output = await api.getCellfieOutput(id);

            dataDispatch({ type: "setOutput", output: output });
          }            
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

  // Clean up timers
  useEffect(() => {
    return () => {
      for (const timer in taskTimers) {
        clearInterval(timer);
      }
    }
  });

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