export const getName = ({ source, accessionId, description, files }) => {
  return accessionId ? accessionId : 
  description ? description :
  source === "upload" && files ? Object.values(files).map(file => file.name).join(", ") :  
  null;
};

export const isPending = ({ status }) => status === "pending";
  
export const isActive = ({ status }) => (
  // Leave this out for now until null status problem has been fixed for immunespace
//  status === "unknown" ||
  status === "submitting" || 
  status === "queued"     || 
  status === "started"
);

export const bootstrapColor = ({ status }) => (
  status === "pending" ? "warning" :
  status === "submitting" ? "primary" :
  status === "queued" ? "info" :
  status === "started" ? "success" :    
  "secondary"
);