import { useContext, useEffect, useReducer } from "react";
import { DataContext, UserContext } from "../../contexts";
import { TaskStatusIcon } from "../task-status-icon";
import { api } from "../../utils/api";
import { taskUtils } from "../../utils/task-utils";

const { isActive } = taskUtils;

// XXX: Should move this to colors.js and use in task-status-icon
const statusColor = {
  submitting: "primary",
  queued: "info",
  started: "success"
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

  // Check status and info
  useEffect(() => {
    tasks.filter(task => isActive(task.status) && !taskTimers[task.id]).forEach(task => {     
      const { id, isImmuneSpace } = task;
      const timer = setInterval(checkStatus, 1000);    

      taskTimersDispatch({ type: "add", id: id, timer: timer });

      checkStatus();

      async function checkStatus() {
        if (!task.info.start_date || !task.info.end_date) {
          const info = await api.getCellfieTaskInfo(id, isImmuneSpace);

          userDispatch({ type: "setInfo", id: id, info: info });
        }

        const status = await api.checkCellfieTaskStatus(id, isImmuneSpace);

        if (status === "finished") {
          clearInterval(timer);            
          taskTimersDispatch({ type: "remove", id: id });

          userDispatch({ type: "setStatus", id: id, status: status });

          if (task.active) {
            const output = await api.getCellfieOutput(id);

            dataDispatch({ type: "setOutput", output: output });
                    
            // Load larger detail scoring asynchronously
            api.getCellfieDetailScoring(id, isImmuneSpace).then(result => {
              dataDispatch({ type: "setDetailScoring", data: result });
            });
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
          <span key={ status } className="me-2">
            <TaskStatusIcon task={{ status: status } } />
            <b className={ `text-${ statusColor[status] } small ms-1`}>{ count }</b>
          </span>
        );
      })}
    </div>
  );
};