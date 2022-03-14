import { useContext } from "react";
import { UserContext } from "../contexts";
import { ViewWrapper } from "../components/view-wrapper";
import { DataSelection } from "../components/data-selection";
import { DataMissing } from "../components/data-missing";
import { UserLink } from "../components/page-links";

export const InputView = () => {
  const [{ user }] = useContext(UserContext);
  
  return (   
    <>
      { !user ?
        <ViewWrapper>
          <DataMissing message="No user user selected" pageLink={ <UserLink /> } />
        </ViewWrapper>
      :
        <ViewWrapper>
          <DataSelection />
        </ViewWrapper>
      }
    </>
  ); 
};