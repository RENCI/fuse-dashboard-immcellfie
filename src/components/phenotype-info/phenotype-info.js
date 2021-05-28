import React from "react";
import { Alert } from "react-bootstrap";
import "./phenotype-info.css";

export const PhenotypeInfo = ({ data }) => {
  return (
    <Alert variant="info" className="phenotypeInfo">
      <u>Phenotype data loaded</u>
      <div><small>{ data.length.toLocaleString() } rows (subjects)</small></div>
      <div><small>{ data.columns.length.toLocaleString() } columns (dimensions)</small></div>
      <div className="ml-3 text-muted">
        <small>{ data.columns.join(", ") }</small>
      </div>
    </Alert>
  );
};           