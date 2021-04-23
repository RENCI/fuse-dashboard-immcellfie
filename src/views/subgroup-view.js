import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { DataGrouping } from "../components/data-grouping";
import { DataMissing } from "../components/data-missing";

export const SubgroupView = () => {
  const [{ phenotypeData }] = useContext(DataContext);

  return (
    <>
      { phenotypeData ? <DataGrouping />
        : <DataMissing message="No data loaded" />
      }
    </>
  ); 
};