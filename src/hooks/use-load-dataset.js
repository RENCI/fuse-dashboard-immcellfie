import { useContext } from "react";
import { DataContext, ErrorContext } from "contexts";
import { api } from "utils/api";

export const useLoadDataset = ()  => {
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async dataset => {
    try {
      //userDispatch({ type: "clearActiveTask" });
      dataDispatch({ type: "setDataset", dataset: dataset });

      if (dataset.files.properties) {
        const properties = await api.getData(dataset);        

        /// XXX: Change properties to properties
        dataDispatch({ type: "setproperties", data: properties });                
      }
      else {
        dataDispatch({ type: "setEmptyproperties" });   
      }
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }      
  };
};