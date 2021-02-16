import React from "react";
import { Button } from "react-bootstrap";

export const SpinnerButton = ({ children, variant, spin, onClick }) => {
  // XXX: Spinner component from react-bootstrap wasn't working, so using spinner classes directly
  return (
    <Button
      variant={ variant }
      disabled={ spin }
      onClick={ onClick }>
      { children }      
      { spin ? <span className="spinner-border spinner-border-sm ml-2" /> : null }
    </Button>
  );
};
