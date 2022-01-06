import { useState, useContext } from "react";
import { Button } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { UserContext, DataContext } from "../../contexts";
import { DownloadList } from "./download-list";
import { states } from "./states";
import { api } from "../../utils/api";
import { ImmunespaceDialog } from "./immunespace-dialog";

export const LoadImmuneSpace = ({ state, onSetState, onError }) => { 
  return (
    <>   
      <DownloadList />      
      <ImmunespaceDialog />
    </>  
  );
};           