import React from "react";


export const DataMissing = ({ message, pageLink }) => {
  return (
    <div className="text-center">
      <h5>{ message }</h5>
      { pageLink }
    </div>
  );
};           