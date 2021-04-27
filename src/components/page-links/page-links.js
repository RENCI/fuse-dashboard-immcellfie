import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { Diagram3, Columns, Table } from "react-bootstrap-icons";

const PageLink = ({ text, icon, page, block }) => {
  const history = useHistory();

  return (
    <Button 
      variant="link"       
      onClick={ () => history.push("/" + page) }
    >
      { React.cloneElement(icon, { className: "mr-2 mb-1" }) }
      { text }
    </Button>
  );
};

export const CellfieLink = () => <PageLink text="CellFIE" icon={ <Table /> } page="cellfie" />;
export const SubgroupsLink = () => <PageLink text="Create subgroups" icon={ <Diagram3 /> } page="subgroups" />;
export const ExpressionLink = () => <PageLink text="View expression data" icon={ <Columns /> } page="expression-data" />;