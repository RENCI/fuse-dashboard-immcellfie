import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { TaskStatusIcon } from "components/task-status-icon";
import { states } from "./states";
import { api } from "utils/api";
import { useLoadDataset } from "hooks";
import styles from "./dataset-list.module.css";

export const DatasetList = ({ state, onSetState }) => {
  const [{ datasets }, userDispatch] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    onSetState(states.loading);

    try {
      loadDataset(dataset);

      onSetState(states.normal);
    }
    catch (error) {
      onSetState(states.normal);
    }
  };

  console.log(datasets);
  console.log(dataset);

  const disabled = state !== states.normal;
  const loaded = d => d === dataset;
  const failed = dataset => dataset.status === "failed";
  const statusValue = status => status === "failed" ? 0 : 1;

  const getSource = d => d.provider.replace("fuse-provider-", "");
  const getName = d => d.accessionId ? d.accessionId : d.description ? d.description : 'NA';
  const getId = d => d.id;
  const getStart = d => d.createdTime.toLocaleString();
  const getEnd = d => d.finishedTime.toLocaleString();
  const getAnalyses = d => 0;
  const getStatus = d => d.status;

  const columns = [  
    {
      name: "",
      accessor: d => (
        failed(d) ? null :
        <Button 
          size="sm"
          disabled={ disabled || loaded(d) }
          onClick={ () => onLoadClick(d) }
        >
          Load
        </Button>
      )
    },
    { 
      name: "Source",
      accessor: getSource,
      sort: (a, b) => getSource(a).localeCompare(getSource(b))
    },
    { 
      name: "Name",
      accessor: getName,
      sort: (a, b) => getName(a).localeCompare(getName(b))
    },
    { 
      name: "ID",
      accessor: getId,
      sort: (a, b) => getId(a).localeCompare(getId(b))
    },  
    { 
      name: "Start",
      accessor: getStart,
      sort: (a, b) => getStart(b) - getStart(a)
    },  
    { 
      name: "End",
      accessor: getEnd,
      sort: (a, b) => getEnd(b) - getEnd(a)
    },
    {
      name: "Analyses",
      accessor: getAnalyses,
      sort: (a, b) => getAnalyses(b) - getAnalyses(a)
    },
    { 
      name: "Status",
      accessor: getStatus,
      sort: (a, b) => statusValue(getStatus(b)) - statusValue(getStatus(a))
    } 
  ];

  return (
    <>
      { datasets.length > 0 &&
        <div className={ styles.tableWrapper }>
          <Table size="sm" hover className="align-middle small">
            <thead>        
              <tr>
                { columns.map((column, i) => (
                  <th 
                    key={ i } 
                    className={ column.name.length > 0 ? "pointer" : null }
                    onClick={ () => setSortColumn(column) }
                  >
                    { column.name }
                  </th>
                ))}   
              </tr>
            </thead>
            <tbody>
              { datasets.slice().sort(sortColumn ? sortColumn.sort : undefined).map((download, i) => (
                <tr key={ i } className={ loaded(download) ? `${ styles.active } border-primary rounded` : null }>
                  { columns.map((column, i) => <td key={ i }>{ column.accessor(download) }</td>)}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      }
    </>
  );
};           