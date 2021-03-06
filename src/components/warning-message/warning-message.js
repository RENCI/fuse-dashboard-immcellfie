import React from "react";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import "./warning-message.css";

export const WarningMessage = ({ message }) => {
  return (
    <>
      <ExclamationTriangleFill 
        className="text-secondary mb-1 ml-1 mr-1"
      />
      { message }
    </>
  );
};           