import { useContext } from "react";
import { UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { DataGrouping } from "components/data-grouping";
import { DataMissing } from "components/data-missing";
import { UserLink, InputLink } from "components/page-links";

export const SubgroupView = () => {
  const [{ user }] = useContext(UserContext);
  const [{ propertiesData }] = useContext(DataContext);

  return (
    <ViewWrapper>
      { !user ?
        <DataMissing message="No user selected" pageLink={ <UserLink /> } />
      : !propertiesData ? 
        <DataMissing message="No data loaded" pageLink={ <InputLink /> } />
      : 
        <DataGrouping />
      }
    </ViewWrapper>
  ); 
};