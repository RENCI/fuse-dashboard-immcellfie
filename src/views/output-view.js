import React, { useContext } from "react";
import { Tabs, Tab } from "react-bootstrap";
import * as d3 from "d3";
import { DataContext } from "../contexts";
import { ModelSelection } from "../components/model-selection";
import { CellfieOutput } from "../components/cellfie-output";
import { DataMissing } from "../components/data-missing";

const practiceData = {
  output: "HPA.expected",
  outputType: "tsv",
  //output: "ASD.output",
  //output: "TD.output",
  //outputType: "csv"
};

export const OutputView = () => {
  const [{ phenotypes, output }] = useContext(DataContext);
  return (
    <>
      { !phenotypes ? <DataMissing message="No data loaded" /> : 
        <ModelSelection 
          outputName={ practiceData.output } 
          outputType={ practiceData.outputType }
        /> 
      }
      { output && <CellfieOutput /> }
    </>
  );  
};