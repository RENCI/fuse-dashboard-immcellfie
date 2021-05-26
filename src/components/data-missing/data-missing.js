import React from "react";
import { HomeLink } from "../page-links";


export const DataMissing = ({ message, showHome }) => {
  return (
    <div className="text-center">
      <h5>{ message }</h5>
      { showHome && <HomeLink /> }
    </div>
  );
};           