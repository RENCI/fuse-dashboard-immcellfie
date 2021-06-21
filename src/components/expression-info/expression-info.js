import React from "react";
import { Alert } from "react-bootstrap";
import "./expression-info.css";

export const ExpressionInfo = ({ expressionData }) => {
  const numGenes = expressionData.data.length;
  const numSubjects = numGenes > 0 ? expressionData.data[0].values.length : 0;

  return (
    <Alert variant="info" className="expressionInfo">
      <u>Expression data loaded</u>
      <div><small>Source: { expressionData.source }</small></div>
      <div><small>Name: { expressionData.name }</small></div>
      <div><small>{ numGenes.toLocaleString() } rows (genes)</small></div>
      <div><small>{ numSubjects.toLocaleString() } columns (subjects)</small></div>
    </Alert>
  );
};           