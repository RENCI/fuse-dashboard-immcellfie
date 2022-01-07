import { DownloadList } from "./download-list";
import { ImmunespaceDialog } from "./immunespace-dialog";

export const LoadImmuneSpace = props => { 
  return (
    <>   
      <DownloadList {...props} />      
      <ImmunespaceDialog {...props} />
    </>  
  );
};           