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
        const properties = await api.getData(dataset);        

        dataDispatch({ type: "setProperties", data: properties });      
      }
      else {
        dataDispatch({ type: "setEmptyProperties" });   
      }

      // Load result data
      if (result) {
        const fileKeys = Object.keys(result.files);

        if (fileKeys.length > 1) {
          console.warn(`More than one result file for ${ result.id }`);
        }

        const data = await api.getData(result, result.files[fileKeys[0]].file_type);

        console.log(data);

        dataDispatch({ type: "setPCAOutput", output: data });
      }
    }
    catch (error) {
      console.log(error);

      dataDispatch({ type: "clearData" });

      errorDispatch({ type: "setError", error: error });
    }
  };
};