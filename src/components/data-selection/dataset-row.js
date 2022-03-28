import {  useState } from "react";
import { Collapse } from "react-bootstrap";
import styles from "./dataset-list.module.css";

// Replace circular references
function replacer(key, value) {
  switch (key) {
    case "input":
      return value.id;

    case "results":
      return value.map(({ id }) => id);

    default:
      return value;
  }
}

export const DatasetRow = ({ dataset, loaded, columns }) => {
  const [showDetails, setShowDetails] = useState(false);

  const finished = dataset.status === "finished";

  const onClick = () => {
    if (finished) setShowDetails(!showDetails);
  };

  let classes = styles.datasetRow;

  if (loaded) {
    classes += ` ${ styles.active } rounded`;

    if (dataset.type === "input") classes += ` ${ styles.input } border-info`;
    else if (dataset.type === "result") classes += ` ${ styles.result } border-warning`;
  }
  

  return (
    <>
      <tr 
        className={ classes }
        style={{ cursor: finished ? "pointer" : "default" }}
        onClick={ onClick }
      >
        { columns.map((column, i) => (
          <td 
            key={ i } 
            className={ column.classes }
          >
            { column.accessor(dataset) }
          </td>
        ))}
      </tr>
      <Collapse 
        in={ showDetails } 
        timeout={ 0 }
      >
        <tr className={ styles.detailsRow }>
          <td colSpan="100%">
            <pre>
              { JSON.stringify(dataset, replacer, 2) }
            </pre>
          </td>
        </tr>
      </Collapse>
    </>
  );
};