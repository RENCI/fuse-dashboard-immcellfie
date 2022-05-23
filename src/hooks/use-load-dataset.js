import { useContext } from "react";
import { DataContext, ModelContext, PCAContext, ErrorContext } from "contexts";
import { api } from "utils/api";

export const useLoadDataset = ()  => {
  const [{ dataset }, dataDispatch] = useContext(DataContext);
  const [, pcaDispatch] = useContext(PCAContext);
  const [, modelDispatch] = useContext(ModelContext);
  const [, errorDispatch] = useContext(ErrorContext);

  return async newDataset => {
    try {
      // Assume any dataset with an input is a result
      let input = null;
      let result = null;
      
      if (newDataset.input) {
        input = newDataset.input;
        result = newDataset;
      }
      else {
        input = newDataset;
      }

      const newInput = !dataset || dataset.id !== input.id;

      // Set input dataset and result info
      if (newInput) {
        dataDispatch({ type: "setDataset", dataset: input });
      }
      if (result) dataDispatch({ type: "setResult", result: result });

      // Load input properties
      if (newInput) {
        if (input.files.properties) {
          const properties = await api.getFile(input);        

          dataDispatch({ type: "setProperties", data: properties });      
        }
        else {
          dataDispatch({ type: "setEmptyProperties" });   
        }
      }

      // Load result data
      if (result) {
        if (result.service === "fuse-tool-pca") {
          const data = await api.getFiles(result);        

          dataDispatch({ type: "setOutput", output: data });

          pcaDispatch({ type: "setParameters", parameters: result.parameters });
        }
        else if (result.service === "fuse-tool-cellfie") {
          // Load all but detail scoring
          const data = await api.getFiles(result, ["detailScoring"]); 
  
          dataDispatch({ type: "setOutput", output: data });

          modelDispatch({ type: "setParameters", parameters: result.parameters });

          // Load detail scoring asynchronously
          api.getFile(result, result.files.detailScoring.file_type).then(result => {
            dataDispatch({ type: "setDetailScoring", data: result });
          });
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