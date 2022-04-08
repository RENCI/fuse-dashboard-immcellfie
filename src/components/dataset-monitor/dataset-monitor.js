import { useContext, useEffect, useRef } from "react";
import { UserContext, ReadyContext, ErrorContext } from "contexts";
import { api } from "utils/api";
import { isPending, isActive } from "utils/dataset-utils";

const pollInterval = 1000;

const getActive = datasets => datasets.filter(isActive);

export const DatasetMonitor = () => {
  const [{ datasets }, userDispatch] = useContext(UserContext);
  const [, readyDispatch] = useContext(ReadyContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const timer = useRef(-1);

  useEffect(() => {
    const loadPending = async () => {
      // Load any pending datasets
      const pending = datasets.filter(isPending);

      for (const info of pending) {
        try {
          if (info.service === "fuse-provider-upload") {          
            const id = await api.uploadData(
              info.service,
              info.user,
              info.files.expressionFile,
              info.files.propertiesFile,
              info.description
            );          

            userDispatch({ type: "updateId", oldId: info.id, newId: id });        
          }
          else if (info.service === "fuse-provider-immunespace") {          
            const id = await api.loadImmunespace(
              info.service,
              info.user,
              info.apiKey,
              info.accessionId,
              info.description
            );

            userDispatch({ type: "updateId", oldId: info.id, newId: id });           
          }
          else if (info.service === "fuse-tool-pca" || info.service === "fuse-tool-cellfie") {
            const id = await api.analyze(
              info.service, 
              info.user, 
              info.parameters,
              info.description
            );

            userDispatch({ type: "updateId", id: info.id, newId: id });            
          }
          else {
            console.warn(`Unknown service ${ info.service }`);

          }
        }  
        catch (error) {
          console.log(error);

          //userDispatch({ type: "removeDataset", id: info.id });

          errorDispatch({ type: "setError", error: error });
        }  
      }
    };

    console.log(datasets);

    const checkStatus = () => {
      clearTimeout(timer.current);

      console.log("checkStatus");

      const active = getActive(datasets);

      console.log(active);
        
      const delay = ms => new Promise(resolve => timer.current = setTimeout(resolve, ms));

      const doCheck = async () => {
        let dispatched = false;

        console.log("polling")

        for (const dataset of active) {
          const id = dataset.id;
          const update = await api.getDataset(id);

          console.log(update);

          if (update.status !== dataset.status) {
            userDispatch({ type: "updateDataset", id: id, dataset: update });
            dispatched = true;

            if (update.status === "finished") {
              readyDispatch({ type: "add", id: id });
            }
          }
        }

        if (!dispatched) {
          await delay(pollInterval);
          doCheck();
        }
      };

      if (active.length > 0) {
        doCheck();
      }
    };

    loadPending();
    checkStatus();
  }, [datasets, userDispatch, readyDispatch, errorDispatch]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return null;
};