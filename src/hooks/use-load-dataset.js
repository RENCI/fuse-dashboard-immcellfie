import { useContext } from "react";
import { DataContext, ErrorContext } from "../contexts";
import { api } from "../utils/api";

export const useLoadDataset = ()  => {
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async dataset => {
    try {
      //userDispatch({ type: "clearActiveTask" });
      dataDispatch({ type: "clearOutput" });
      dataDispatch({ type: "setDataset", dataset: dataset });

      if (dataset.propertiesFile) {
        const properties = await api.getData(dataset);

        console.log(properties);

        // XXX: DataInfo should be removed
        dataDispatch({
          type: "setDataInfo",
          source: "upload"          
        });

        /// XXX: Change phenotypes to properties
        dataDispatch({ type: "setPhenotypes", data: properties });                
      }
      else {
        // XXX: Phenotype data is optional
      }
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }      
  };
};