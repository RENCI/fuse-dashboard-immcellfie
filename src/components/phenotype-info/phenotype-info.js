import React from "react";
import { Alert } from "react-bootstrap";
import "./phenotype-info.css";

export const PhenotypeInfo = ({ source, name, data }) => {
  return (
    <Alert variant="info" className="phenotypeInfo">
      { data ? 
        <>
          <u>Phenotype data loaded</u>
          <div><small>Source: { source }</small></div>
          <div><small>Name: { name }</small></div>
          <div><small>{ data.length.toLocaleString() } rows (samples)</small></div>
          <div><small>{ data.columns.length.toLocaleString() } columns (dimensions)</small></div>
          <div className="ml-3 text-muted">
            <small>{ data.columns.join(", ") }</small>
          </div>
        </>
      :
        <>
          No phenotype data
        </>
      }
    </Alert>
  );
};           