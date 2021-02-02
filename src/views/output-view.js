import React, { useContext } from "react";
import { DataContext } from "../contexts";

export const OutputView = () => {
  const [data] = useContext(DataContext);

  const { output } = data;

  return (
    <div>{ output ? JSON.stringify(output) : "No output" }</div>
  );  
};