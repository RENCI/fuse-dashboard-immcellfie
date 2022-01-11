import { ExclamationTriangleFill } from "react-bootstrap-icons";

export const WarningMessage = ({ message }) => {
  return (
    <>
      <ExclamationTriangleFill 
        className="text-secondary mb-1 ml-1 me-1"
      />
      { message }
    </>
  );
};           