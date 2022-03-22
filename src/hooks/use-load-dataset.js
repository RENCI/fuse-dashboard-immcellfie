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

        dataDispatch({ type: "setProperties", data: properties });      
      }
      else {
        dataDispatch({ type: "setEmptyProperties" });   
      }
    }
    catch (error) {
      console.log(error);

      dataDispatch({ type: "clearData" });

      errorDispatch({ type: "setError", error: error });
    }
  };
};