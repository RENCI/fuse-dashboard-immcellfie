export const getName = ({ source, accessionId, description, files, finishedTime }) => {
  return accessionId ? accessionId : 
  description ? description :
  source === "upload" && files ? Object.values(files).map(file => file.name).join(", ") :  
  null;
};
  
export const isActive = ({ status }) => (
  status === "submitting" || 
  status === "queued"     || 
  status === "started"
);