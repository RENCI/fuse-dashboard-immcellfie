export const getName = ({ accessionId, files }) => 
  accessionId ? accessionId : 
  Object.values(files).map(file => file.name).join(", ");
  