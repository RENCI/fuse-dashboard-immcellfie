import React, { useContext } from "react";
import { DataContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { DataGrouping } from "../components/data-grouping";
import { DataMissing } from "../components/data-missing";

export const SubgroupView = () => {
  const [{ phenotypeData }] = useContext(DataContext);

  return (
    <ViewWrapper>
      { phenotypeData ? <DataGrouping />
        : <DataMissing message="No data loaded" showHome={ true } />
      }
    </ViewWrapper>
  ); 
};