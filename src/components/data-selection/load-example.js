import { useContext } from "react";
import { Form } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { states } from "./states";
import { api } from "../../utils/api";
import { exampleData } from "../../utils/datasets";

const { Group } = Form;

export const LoadExample = ({ state, onSetState, onError }) => {
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);

  const onLoadExampleClick = async () => {
    onSetState(states.loading);
    onError();

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

      onError(error);
    }

    onSetState(states.normal);
  };

  const disabled = state !== states.normal;

  return (  
    <Group>
      <h6>Load example data</h6>
      <SpinnerButton 
        variant="primary"
        disabled={ disabled }
        spin={ state === "loading" }
        onClick={ onLoadExampleClick }
      >
        Load
      </SpinnerButton>
    </Group>
  );
};           