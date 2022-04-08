import { Button, Spinner } from "react-bootstrap";

export const SpinnerButton = ({ children, variant, size, replace, spin, disabled, onClick }) => {
  return (
    <Button
      variant={ variant }
      disabled={ disabled }
      size={ size }
      onClick={ onClick }>
      { !(replace && spin) && children }      
      { spin && 
        <Spinner 
          className={ !replace ? "ms-1" : null }
          animation="border" 
          size="sm" 
          as="span" 
        />
      }
    </Button>
  );
};
