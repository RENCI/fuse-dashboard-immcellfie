import React from "react";
import { ViewWrapper } from "../components/view-wrapper";
import { UserInput } from "../components/user-input";
import { DataSelection } from "../components/data-selection";

export const Home = () => {
  return (   
    <ViewWrapper>
      <UserInput />
      <DataSelection />
    </ViewWrapper>
  ); 
};