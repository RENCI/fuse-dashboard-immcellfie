import React from "react";
import { Alert } from "react-bootstrap";
import "./expression-info.css";

export const ExpressionInfo = ({ data }) => {
  const numGenes = data.data.length;
  const numSubjects = numGenes > 0 ? data.data[0].values.length : 0;

  return (
    <Alert variant="info" className="expressionInfo">
      <u>Expression data loaded</u>
      <div><small>{ numGenes.toLocaleString() } rows (genes)</small></div>
      <div><small>{ numSubjects.toLocaleString() } columns (subjects)</small></div>
    </Alert>
  );
};           