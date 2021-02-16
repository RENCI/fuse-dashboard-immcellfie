import React from "react";
import { Button, Spinner } from "react-bootstrap";

export const SpinnerButton = ({ children, variant, spin, onClick }) => {
  return (
    <Button
      variant={ variant }
      disabled={ spin }
      onClick={ onClick }>
      { children }      
      { spin && 
        <Spinner 
          className="ml-1"
          animation="border" 
          size="sm" 
          as="span" 
        />
      }
    </Button>
  );
};
