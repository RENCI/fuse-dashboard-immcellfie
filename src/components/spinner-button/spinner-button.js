
import { Button, Spinner } from "react-bootstrap";

export const SpinnerButton = ({ children, variant, disabled, spin, block = false, size, onClick }) => {
  return (
    <div className={ block ? "d-grid" : "" }>
      <Button
        variant={ variant }
        disabled={ disabled }
        block={ block }
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
    </div>
  );
};
