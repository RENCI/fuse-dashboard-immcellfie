import React from "react";
import { Alert } from "react-bootstrap";
import "./phenotype-info.css";

export const PhenotypeInfo = ({ phenotypeData }) => {
  return (
    <Alert variant="info" className="phenotypeInfo">
      <u>Phenotype data loaded</u>
      <div><small>Source: { phenotypeData.source }</small></div>
      <div><small>Name: { phenotypeData.name }</small></div>
      <div><small>{ phenotypeData.data.length.toLocaleString() } rows (subjects)</small></div>
      <div><small>{ phenotypeData.data.columns.length.toLocaleString() } columns (dimensions)</small></div>
      <div className="ml-3 text-muted">
        <small>{ phenotypeData.data.columns.join(", ") }</small>
      </div>
    </Alert>
  );
};           