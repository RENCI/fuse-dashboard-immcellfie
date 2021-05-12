import React from "react";
import { DataSelection } from "../components/data-selection";

const practiceData = {
  phenotype: "testphenotypes.csv"
};

export const Home = () => {
  return (    
    <DataSelection 
      inputName={ practiceData.input } 
      phenotypeName={ practiceData.phenotype }
    />
  ); 
};