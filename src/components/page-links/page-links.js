import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { PersonCircle, Files, Diagram3, Calculator, Table } from "react-bootstrap-icons";
import { getServiceName, getServiceDisplay } from "utils/config-utils";

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
export const DataLink = () => <PageLink text="Select data" icon={ <Files /> } page="data" />;
export const AnalyzeLink = ({ tool }) => {
  const hash = tool ? "#" + getServiceName(tool) : "";
  const display = tool ? getServiceDisplay(tool) : "Analyze";

  return <PageLink text={ display } icon={ <Calculator /> } page={ `analyze${ hash }` } />;
};
export const SubgroupsLink = () => <PageLink text="Create subgroups" icon={ <Diagram3 /> } page="subgroups" />;
export const ExpressionLink = () => <PageLink text="View expression data" icon={ <Table /> } page="expression-data" />;