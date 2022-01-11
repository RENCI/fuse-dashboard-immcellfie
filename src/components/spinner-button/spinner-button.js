import { Button, Spinner } from "react-bootstrap";

export const SpinnerButton = ({ children, variant, disabled, spin, size, onClick }) => {
  return (
    <Button
      variant={ variant }
      disabled={ disabled }
      size={ size }
      onClick={ onClick }>
      { children }      
      { spin && 
        <Spinner 
          className="ms-1"
          animation="border" 
          size="sm" 
          as="span" 
        />
      }
    </Button>
  );
};
