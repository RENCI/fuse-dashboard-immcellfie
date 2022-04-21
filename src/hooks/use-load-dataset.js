import { useContext } from "react";
import { DataContext, ModelContext, PCAContext, ErrorContext } from "contexts";
import { api } from "utils/api";

export const useLoadDataset = ()  => {
  const [, dataDispatch] = useContext(DataContext);
  const [, pcaDispatch] = useContext(PCAContext);
  const [, modelDispatch] = useContext(ModelContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async dataset => {
    try {
      // Assume any dataset with an input is a result
      let input = null;
      let result = null;
      
      if (dataset.input) {
        input = dataset.input;
        result = dataset;
      }
      else {
        input = dataset;
      }

      // Set input dataset and result info
      dataDispatch({ type: "setDataset", dataset: input });
      if (result) dataDispatch({ type: "setResult", result: result });

      // Load input properties
      if (input.files.properties) {
        const properties = await api.getFile(input);        

        dataDispatch({ type: "setProperties", data: properties });      
      }
      else {
        dataDispatch({ type: "setEmptyProperties" });   
      }

      // Load result data
      if (result) {
        const data = await api.getFiles(result);


        console.log(data);
        

        dataDispatch({ type: "setOutput", output: data });

        if (result.service === "fuse-tool-pca") {
          pcaDispatch({ type: "setParameters", parameters: result.parameters });
        }
        else if (result.service === "fuse-tool-cellfie") {
          modelDispatch({ type: "setParameters", parameters: result.parameters });
        }
        else {
          console.warn("Unknown service")
        }
      }
    }
    catch (error) {
      console.log(error);

      dataDispatch({ type: "clearData" });

      errorDispatch({ type: "setError", error: error });
    }
  };
};