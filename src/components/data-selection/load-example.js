import { useContext } from "react";
import { UserContext, DataContext, ErrorContext } from "../../contexts";
import { LoadNewButton } from "./load-new-button";
import { states } from "./states";
import { api } from "../../utils/api";
import { exampleData } from "../../utils/datasets";

export const LoadExample = ({ state, onSetState }) => {
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);

  const onLoadExampleClick = async () => {
    onSetState(states.loading);

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {      
      const expressionData = await api.loadExampleData(exampleData.expressionData);
      const phenotypeData = await api.loadExampleData(exampleData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: { name: "example" }});

      // Set phenotype data first
      dataDispatch({ type: "setPhenotypes", data: phenotypeData });
      dataDispatch({ type: "setExpressionData", data: expressionData });
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error });
    }

    onSetState(states.normal);
  };

  const disabled = state !== states.normal;

  return (
    <LoadNewButton 
      text="Retrieve example data"
      onClick={ onLoadExampleClick }
    />
  );
};           