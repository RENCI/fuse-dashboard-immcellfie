import React, { useContext } from "react";
import { DataContext } from "../contexts";

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  return (
    <pre>{ input ? JSON.stringify(input, null, 2) : "No input" }</pre>
  ); 
};