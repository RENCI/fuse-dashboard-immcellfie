import React from "react";
import { HomeLink } from "../page-links";


export const DataMissing = ({ message, showHome }) => {
  return (
    <>
      <h5>{ message }</h5>
      { showHome && <HomeLink /> }
    </>
  );
};           