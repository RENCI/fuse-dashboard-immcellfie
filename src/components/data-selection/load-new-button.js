import { Button } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";

export const LoadNewButton = ({ text, onClick }) => {
  return (
    <Button 
      className="ms-1" 
      variant="outline-primary" 
      onClick={ onClick }
    >
      <PlusCircle className="icon-offset" /> { text }
    </Button>
  );
};           