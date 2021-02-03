import React, { useContext } from "react";
import { DataContext } from "../contexts";

export const OutputView = () => {
  const [data] = useContext(DataContext);

  const { output } = data;

  return (
    <pre>{ output ? JSON.stringify(output, null, 2) : "No output" }</pre>
  );  
};