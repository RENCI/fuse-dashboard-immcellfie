export const getName = ({ accessionId, files }) => 
  accessionId ? accessionId : 
  files ? Object.values(files).map(file => file.name).join(", ") :
  "";
  
export const isActive = ({ status }) => (
  status === "submitting" || 
  status === "queued"     || 
  status === "started"
);