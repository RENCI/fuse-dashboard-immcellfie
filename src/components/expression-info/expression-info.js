import React from "react";
import { Alert } from "react-bootstrap";
import "./expression-info.css";

export const ExpressionInfo = ({ source, name, data }) => {
  const numGenes = data ? data.length : 0;
  const numSubjects = numGenes > 0 ? data[0].values.length : 0;

  return (
    <Alert variant="primary" className="expressionInfo">
      { data ? 
        <>
          <u>Expression data loaded</u>
          <div><small>Source: { source }</small></div>
          <div><small>Name: { name }</small></div>
          <div><small>{ numGenes.toLocaleString() } rows (genes)</small></div>
          <div><small>{ numSubjects.toLocaleString() } columns (subjects)</small></div>
        </>
      : <>
          <u>Expression data located on server</u>
          <div><small>Source: { source }</small></div>
          <div><small>Name: { name }</small></div>
        </>
      }
    </Alert>
  );
};           