import React, { useContext } from "react";
import { UserContext, DataContext } from "../../contexts";
import { SpinnerButton } from "../spinner-button";
import { states } from "./states";
import { api } from "../../utils/api";
import { practiceData } from "../../utils/datasets";

export const LoadPractice = ({ state, onSetState, onError }) => {
  const [, userDispatch] = useContext(UserContext);
  const [, dataDispatch] = useContext(DataContext);

  const onLoadPracticeClick = async () => {
    onSetState(states.loading);
    onError();

    dataDispatch({ type: "clearData" });
    userDispatch({ type: "clearActiveTask" });

    try {      
      const expressionData = await api.loadPracticeData(practiceData.expressionData);
      const phenotypeData = await api.loadPracticeData(practiceData.phenotypes);

      dataDispatch({ type: "setDataInfo", source: { name: "practice" }});

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
    <>
      <h6>Load practice data</h6>
      <SpinnerButton 
        variant="outline-secondary"
        disabled={ disabled }
        spin={ state === "loading" }
        block={ true }
        onClick={ onLoadPracticeClick }
      >
        Load
      </SpinnerButton>
    </>
  );
};           