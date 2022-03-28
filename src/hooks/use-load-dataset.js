import { useContext } from "react";
import { DataContext, ErrorContext } from "contexts";
import { api } from "utils/api";

export const useLoadDataset = ()  => {
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async (dataset, result = null) => {
    try {
      //userDispatch({ type: "clearActiveTask" });
      dataDispatch({ type: "setDataset", dataset: dataset });
      if (result) dataDispatch({ type: "setResult", result: result });

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