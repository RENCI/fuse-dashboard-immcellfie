import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { ModelSelection } from "../components/model-selection";
import { SubgroupSelection } from "../components/subgroup-selection";
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
  const [{ phenotypeData, output }] = useContext(DataContext);
  
  return (
    <>
      { !phenotypeData ? <DataMissing message="No data loaded" showHome={ true } /> : 
        <ModelSelection 
          outputName={ practiceData.output } 
          outputType={ practiceData.outputType }
        />         
      }            
      { output && 
        <>
          <SubgroupSelection />
          <CellfieOutput /> 
        </>
      }
    </>
  );  
};