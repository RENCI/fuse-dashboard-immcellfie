import { Spinner } from "react-bootstrap";

export const LoadingSpinner = () => {
  return (
    <>
      Loading 
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
