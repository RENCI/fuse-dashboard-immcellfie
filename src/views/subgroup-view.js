import { useContext } from "react";
import { UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { DataGrouping } from "components/data-grouping";
import { DataMissing } from "components/data-missing";
import { UserLink, InputLink } from "components/page-links";

export const SubgroupView = () => {
  const [{ user }] = useContext(UserContext);
  const [{ dataset, propertiesData }] = useContext(DataContext);

  return (
    <ViewWrapper>
      { !user ?
        <DataMissing message="No user selected" pageLink={ <UserLink /> } />
      : !dataset ?
        <DataMissing message="No dataset selected" pageLink={ <InputLink /> } />
      : !propertiesData ? 
        <DataMissing message="Dataset does not contain properties data" pageLink={ <InputLink /> } />
      : 
        <DataGrouping />
      }
    </ViewWrapper>
  ); 
};