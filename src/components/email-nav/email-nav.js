import React, { useContext } from "react";
import { UserContext } from "../../contexts";

export const EmailNav = () => {
  const [{ email },] = useContext(UserContext);

  return (
    email && 
    <div className="text-info border border-info rounded px-2 py-1">
      User: <b>{ email }</b>
    </div>
  );
};           