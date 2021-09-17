import React, { useContext } from "react";
import { UserContext } from "../../contexts";
import "./email-nav.css";

export const EmailNav = () => {
  const [{ email },] = useContext(UserContext);

  return (
    email && 
    <div className="emailNav text-info ml-5 border border-info rounded px-2 py-1">
      User: <b>{ email }</b>
    </div>
  );
};           