import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { PersonCircle, Files, Diagram3, Calculator, Table } from "react-bootstrap-icons";

const PageLink = ({ text, icon, page }) => {
  const history = useHistory();

  return (
    <Button 
      variant="link"
      className="py-0"
      onClick={ () => history.push("/" + page) }
    >
      { React.cloneElement(icon, { className: "me-2 mb-1" }) }
      { text }
    </Button>
  );
};

export const UserLink = () => <PageLink text="Select user" icon={ <PersonCircle /> } page="user" />;
export const InputLink = () => <PageLink text="Select input dataset" icon={ <Files /> } page="data" />;
export const CellfieLink = () => <PageLink text="CellFIE" icon={ <Calculator /> } page="analyze" />;
export const SubgroupsLink = () => <PageLink text="Create subgroups" icon={ <Diagram3 /> } page="subgroups" />;
export const ExpressionLink = () => <PageLink text="View expression data" icon={ <Table /> } page="expression-data" />;