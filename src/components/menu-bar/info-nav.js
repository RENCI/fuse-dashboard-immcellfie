import { useContext } from "react";
import { UserContext, DataContext } from "contexts";
import { DatasetStatus } from "./dataset-status";
import { getName } from "utils/dataset-utils";
import styles from "./info-nav.module.css";

export const InfoNav = () => {
  const [{ user },] = useContext(UserContext);
  const [{ dataset, result },] = useContext(DataContext);

  const name = dataset => {
    if (!dataset) return "None loaded";

    let name = getName(dataset);

    return name ? name : "No name";
  };

  return (
    user && 
    <div style={{ width: "100%"}} className="small d-flex justify-content-around gap-3">
        <div className="text-light">
          <div className="text-white-50">User</div>
          <div>{ user }</div>
        </div>
        <div className="text-info">
          <div className="text-white-50">Input</div>
          <div className={ styles.message }>{ name(dataset) }</div>
        </div>
        <div className="text-warning">
          <div className="text-white-50">Result</div>
          <div className={ styles.message }>{ name(result) }</div>
        </div>
        <div className="d-flex align-items-center">
          <DatasetStatus />
        </div>
    </div>
  );
};           