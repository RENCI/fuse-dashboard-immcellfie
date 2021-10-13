import React, { useContext } from "react";
import { UserContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { DataSelection } from "../components/data-selection";
import { DataMissing } from "../components/data-missing";
import { HomeLink } from "../components/page-links";

export const InputView = () => {
  const [{ email }] = useContext(UserContext);
  
  return (   
    <>
      { !email ?
        <ViewWrapper>
          <DataMissing message="No user email selected" pageLink={ <HomeLink /> } />
        </ViewWrapper>
      :
        <ViewWrapper>
          <DataSelection />
        </ViewWrapper>
      }
    </ViewWrapper>
  ); 
};