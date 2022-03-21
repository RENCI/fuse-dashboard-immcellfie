import { Alert } from "react-bootstrap";
import styles from "./properties-info.module.css";

export const PropertiesInfo = ({ source, name, data }) => {
  return (
    <Alert variant="primary" className={ styles.alert }>
      { data ? 
        <>
          <u>Properties data loaded</u>
          <div><small>Source: { source }</small></div>
          <div><small>Name: { name }</small></div>
          <div><small>{ data.length.toLocaleString() } rows (samples)</small></div>
          <div><small>{ data.columns.length.toLocaleString() } columns (dimensions)</small></div>
          <div className="ms-3 text-muted">
            <small>{ data.columns.join(", ") }</small>
          </div>
        </>
      :
        <>
          No properties data
        </>
      }
    </Alert>
  );
};           