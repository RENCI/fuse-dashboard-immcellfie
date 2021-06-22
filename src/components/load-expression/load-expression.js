import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { practiceData } from "../../datasets";
import { api } from "../../api";

export const LoadExpression = () => {
  const [{ dataInfo }, dataDispatch] = useContext(DataContext);  
  
  const onLoadDataClick = async () => {
    if (dataInfo.source === "practice") {
      const data = await api.loadPracticeData(practiceData.expressionData);
  
      dataDispatch({ type: "setExpressionData", data: data });      
    }
    else if (dataInfo.source === "ImmuneSpace") {
      // XXX: Handle this case
    }
  };

  return (
    <Button
      variant="outline-primary"
      onClick={ onLoadDataClick }
    >
      Load expression data
    </Button>
  );
};
