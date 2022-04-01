import { useContext } from "react";
import { DataContext, ErrorContext } from "contexts";
import { api } from "utils/api";

export const useLoadDataset = ()  => {
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async (dataset, result = null) => {
    try {
      // Set input dataset and result info
      dataDispatch({ type: "setDataset", dataset: dataset });
      if (result) dataDispatch({ type: "setResult", result: result });

      // Load input properties
      if (dataset.files.properties) {
        const properties = await api.getFile(dataset);        

        dataDispatch({ type: "setProperties", data: properties });      
      }
      else {
        dataDispatch({ type: "setEmptyProperties" });   
      }

      // Load result data
      if (result) {
        const data = await api.getFiles(result);

        // XXX: Have one setOutput, switch in context based on type
        dataDispatch({ type: "setOutput", output: data });
      }
    }
    catch (error) {
      console.log(error);

      dataDispatch({ type: "clearData" });

      errorDispatch({ type: "setError", error: error });
    }
  };
};