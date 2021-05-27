import React from "react";
import { ViewWrapper } from "../components/view-wrapper";
import { DataSelection } from "../components/data-selection";

const practiceData = {
  phenotype: "testphenotypes.csv"
};

export const Home = () => {
  return (   
    <ViewWrapper>
      <DataSelection 
        inputName={ practiceData.input } 
        phenotypeName={ practiceData.phenotype }
      />
    </ViewWrapper>
  ); 
};