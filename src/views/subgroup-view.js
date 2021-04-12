import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { DataGrouping } from "../components/data-grouping";
import { DataMissing } from "../components/data-missing";

export const SubgroupView = () => {
  const [{ phenotypes }] = useContext(DataContext);

  return (
    <>
      { phenotypes ? <DataGrouping />
        : <DataMissing message="No data loaded" />
      }
    </>
  ); 
};