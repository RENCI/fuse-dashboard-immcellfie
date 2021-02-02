import React, { useContext } from "react";
import { DataContext } from "../contexts";

export const InputView = () => {
  const [data] = useContext(DataContext);

  const { input } = data;

  return (
    <div>{ input ? JSON.stringify(input) : "No input" }</div>
  ); 
};