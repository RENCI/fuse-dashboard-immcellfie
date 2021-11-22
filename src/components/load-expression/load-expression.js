import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { practiceData } from "../../utils/datasets";
import { api } from "../../utils/api";

export const LoadExpression = () => {
  const [{ dataInfo }, dataDispatch] = useContext(DataContext);  
  
  const onLoadDataClick = async () => {
    if (dataInfo.source.name === "practice") {
      const data = await api.loadPracticeData(practiceData.expressionData);
  
      dataDispatch({ type: "setExpressionData", data: data });      
    }
    else if (dataInfo.source.name === "ImmCellFIE") {
      const data = await api.loadDataUrl(dataInfo.expressionInfo.url);

      dataDispatch({ type: "setExpressionData", data: data });   
    }
    else if (dataInfo.source.name === "ImmuneSpace") {
      const data = await api.getImmuneSpaceExpressionData(dataInfo.source.downloadId);

      // Make sure csv, not tsv
      dataDispatch({ type: "setExpressionData", data: data });
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
