import styles from "./dataset-list.module.css";

export const DatasetRow = ({ dataset, loaded, columns, stripe }) => {
  let classes = styles.datasetRow;
  if (stripe) classes += ` ${ styles.stripe }`;

  if (loaded) {
    classes += ` ${ styles.active }`;

    if (dataset.type === "input") classes += ` border-info`;
    else if (dataset.type === "result") classes += ` border-warning`;
  }

  return (
    <tr className={ classes }>
      { columns.map((column, i) => (
        <td 
          key={ i } 
          className={ column.classes }
        >
          { column.accessor(dataset) }
        </td>
      ))}
    </tr>
  );
};