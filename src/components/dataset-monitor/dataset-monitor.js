import { useContext, useEffect, useReducer, useRef } from "react";
import { LoadingContext, DataContext, UserContext } from "contexts";
import { api } from "utils/api";
import { isActive } from "utils/dataset-utils";

const getActive = datasets => datasets.filter(isActive);

export const DatasetMonitor = () => {
  const [{ datasets }, userDispatch] = useContext(UserContext);
  const timer = useRef(-1);

  useEffect(() => {
    const loadPending = async () => {
      // Load any pending datasets
      const pending = datasets.filter(({ status }) => status === "pending");

      for (const info of pending) {
        if (info.provider === "fuse-provider-upload") {
          const id = await api.uploadData(
            info.provider,
            info.user,
            info.expressionFile,
            info.propertiesFile,
            info.description
          );

          const dataset = await api.getDataset(id);
          
          userDispatch({ type: "updateDataset", id: info.id, dataset: dataset });
        }
        // XXX: Add checks for other services
      }    
    };

    const checkStatus = () => {
      const active = getActive(datasets);

      timer.current = setTimeout(async () => {
        let dispatched = false;

        for (const dataset of active) {
          const id = dataset.id;
          const update = await api.getDataset(id);

          if (update.status !== dataset.status) {        
            userDispatch({ type: "updateDataset", id: id, dataset: update });
            dispatched = true;
          }
        }

        if (!dispatched) checkStatus();
      });
    };

    loadPending();
    checkStatus();
  }, [datasets, userDispatch]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);


/*  
  const [timers, timersDispatch] = useReducer((state, action) => {
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
*/  
/*
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
*/
/*
  const taskCounts = tasks.filter(({ status }) => isActive(status)).reduce((taskCounts, task) => {
    if (!taskCounts[task.status]) taskCounts[task.status] = 0;

    taskCounts[task.status] ++;

    return taskCounts;
  }, {});
*/
  return null;
};