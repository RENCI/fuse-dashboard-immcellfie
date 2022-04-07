import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { DatasetStatus } from "./dataset-status";
import { getName } from "utils/dataset-utils";

export const InfoNav = () => {
  const [{ user },] = useContext(UserContext);
  const [{ dataset, result },] = useContext(DataContext);

  const name = dataset => {
    if (!dataset) return "none loaded";

    let name = getName(dataset);

    return name ? name : "no name";
  };

  return (
    user && 
    <div style={{ width: "100%"}} className="text-info small d-flex justify-content-evenly">
        <div>
          <div>User</div>
          <div><b>{ user }</b></div>
        </div>
        <div>
          <div>Input</div>
          <div><b>{ name(dataset) }</b></div>
        </div>
        <div>
          <div>Result</div>
          <div><b>{ name(result) }</b></div>
        </div>
        <div className="d-flex align-items-center">
          <DatasetStatus />
        </div>
    </div>
  );
};           