import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { HouseDoor, FileEarmarkPlus, Diagram3, Calculator, Table } from "react-bootstrap-icons";

const PageLink = ({ text, icon, page }) => {
  const history = useHistory();

  return (
    <Button 
      variant="link"
      className="py-0"
      onClick={ () => history.push("/" + page) }
    >
      { React.cloneElement(icon, { className: "mr-2 mb-1" }) }
      { text }
    </Button>
  );
};

export const HomeLink = () => <PageLink text="Home" icon={ <HouseDoor /> } page="" />;
export const InputLink = () => <PageLink text="Select input data" icon={ <FileEarmarkPlus /> } page="input" />;
export const CellfieLink = () => <PageLink text="Run CellFIE" icon={ <Calculator /> } page="cellfie" />;
export const SubgroupsLink = () => <PageLink text="Create subgroups" icon={ <Diagram3 /> } page="subgroups" />;
export const ExpressionLink = () => <PageLink text="View expression data" icon={ <Table /> } page="expression-data" />;