import { Spinner } from "react-bootstrap";

export const LoadingSpinner = ({ text = "Loading" }) => {
  return (
    <>
      { text } 
      <Spinner 
        className="ms-1"
        animation="border" 
        variant="info"
        size="sm" 
        as="span" 
      />
    </>
  );
};
