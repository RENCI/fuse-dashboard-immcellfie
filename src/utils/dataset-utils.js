export const getName = ({ accessionId, description, files }) => {
  return accessionId ? accessionId : 
  description ? description :
  files ? Object.values(files).map(file => file.name).join(", ") :
  "";
};
  
export const isActive = ({ status }) => (
  status === "submitting" || 
  status === "queued"     || 
  status === "started"
);