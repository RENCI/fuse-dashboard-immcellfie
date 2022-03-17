export const getName = ({ accessionId, description, files }) => 
  accessionId ? accessionId : 
  description ? description :
  Object.values(files).map(file => file.name).join(", ");
  