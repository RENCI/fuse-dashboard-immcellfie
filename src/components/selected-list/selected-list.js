import React from "react";
import { Toast } from "react-bootstrap";

export const SelectedList = ({ nodes }) => {
  const selected = nodes.filter(({ data }) => data.selected).map(({ data }, i, a) => {
    return (
      <small 
        key={ i }
        className="text-muted"
      >
        { data.name + (i < a.length - 1 ? ", " : "" )}
      </small>
    );
  });

  return (
    <>
      <small>Selected: </small>{ selected.length > 0 ? selected : <small className="text-muted">None</small> }
    </>
  );
};
