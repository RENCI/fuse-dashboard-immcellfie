import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";

export const SelectedList = ({ nodes }) => {
  const [, dataDispatch] = useContext(DataContext);

  const onCloseClick = name => {
    dataDispatch({ type: "selectNode", name: name, selected: false });
  };

  const selected = nodes.filter(({ data }) => data.selected).map(({ data }, i, a) => {
    return (
      <>
        <small 
          key={ i }
          className="text-muted"
        >
          { data.name }
        </small>
        <Button 
          variant="link"
          className="text-muted p-0 mb-1"
          onClick={ () => onCloseClick(data.name) }
        >
          <X />
        </Button>
        { i < a.length - 1 && <small>, </small> }
      </>
    );
  });

  return (
    <>
      <small>Selected: </small>
      { selected.length > 0 ? selected : <small className="text-muted">None</small> }
    </>
  );
};
