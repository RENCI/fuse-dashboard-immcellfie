import { useContext, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { TaskStatusIcon } from "components/task-status-icon";
import { DatasetRow } from "./dataset-row";
import { states } from "./states";
import { getName } from "utils/dataset-utils";
import { useLoadDataset } from "hooks";
import styles from "./dataset-list.module.css";

const statusOrder = [
  "pending",
  "submitting",
  "queued",
  "started",
  "finished",
  "failed"
].reduce((order, status, i) => { 
  order[status] = i;
  return order;
}, {});

const failed = d => d.status === "failed";
const hasData = d => d.status === "finished" && d.files;

const getSource = d => d.provider.replace("fuse-provider-", "");
const getIdentifier = d => d.accessionId ? d.accessionId : 
  d.files ? Object.values(d.files).map(file => file.name).join(", ") :
  "";
const getDescription = d => d.description;
//const getStart = d => d.createdTime.toLocaleString();
const getFinished = d => d.finishedTime ? d.finishedTime.toLocaleString() : null;
const getFinishedDisplay = d => {
  if (!d.finishedTime) return d.status;

  const now = new Date();
  const date = d.finishedTime;

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() ? 
    date.getDate() === now.getDate() ? `Today, ${ date.toLocaleTimeString() }` : 
    date.getDate() === now.getDate() - 1 ? `Yesterday, ${ date.toLocaleTimeString() }` : 
    d.finishedTime.toLocaleString() : 
    d.finishedTime.toLocaleString();
};
const getAnalyses = d => 0;
const getStatus = d => d.status;

export const DatasetList = () => {
  const [{ datasets }] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);
  const [state, setState] = useState(states.normal);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    setState(states.loading);

    try {
      loadDataset(dataset);

      setState(states.normal);
    }
    catch (error) {
      setState(states.normal);
    }
  };

  const loaded = d => d === dataset;
  const disabled = state !== states.normal;

  const columns = [  
    {
      name: "",
      accessor: d => (
        <div style={{ visibility: (hasData(d) && !failed(d)) ? "visible" : "hidden" }}>
          <Button 
            size="sm"
            disabled={ disabled || loaded(d) }
            onClick={ evt => {
              evt.stopPropagation();
              onLoadClick(d);
            }}
          >
            Load
          </Button>
        </div>
      )
    },
    { 
      name: "Source",
      accessor: getSource,
      sort: (a, b) => getSource(a).localeCompare(getSource(b))
    },
    { 
      name: "Identifier",
      accessor: getIdentifier,
      sort: (a, b) => getIdentifier(a).localeCompare(getIdentifier(b))
    },
    { 
      name: "Description",
      accessor: getDescription,
      sort: (a, b) => {
        const da = getDescription(a);
        const db = getDescription(b);
        return !da && !db ? 0 : !da ? 1 : !db ? -1 : 
          getDescription(a).localeCompare(getDescription(b));
      }
    },  
/*    
    { 
      name: "Start",
      accessor: getStart,
      sort: (a, b) => {
        console.log(getStart(a), getStart(b));
        console.log(getStart(a) > getStart(b));
        return getStart(b) - getStart(a);
      }
    },  
*/    
    { 
      name: "Finished",
      accessor: getFinishedDisplay,
      sort: (a, b) => getFinished(b) - getFinished(a)
    },
    {
      name: "Analyses",
      accessor: getAnalyses,
      sort: (a, b) => getAnalyses(b) - getAnalyses(a),
      classes: "text-center"
    },
    { 
      name: "Status",
      accessor: d => {
        // XXX: Currently not receiving any error message. Revisit if this becomes available.
        /*        
        return !failed(d) ?
          <>
            <TaskStatusIcon task={ d } />
            <OverlayTrigger
              placement="left"
              overlay={ 
                <Popover>
                  <Popover.Header>Error message</Popover.Header>
                  <Popover.Body>{ d.stderr }</Popover.Body>
                </Popover>
              }
            >
              <QuestionCircle className="ms-2 text-secondary" />
            </OverlayTrigger>
          </>
        :
        */
        return <TaskStatusIcon task={ d } />
      },
      sort: (a, b) => statusOrder[getStatus(a)] - statusOrder[getStatus(b)],
      classes: "text-center"
    } 
  ];

  return (
    <>
      { datasets.length > 0 &&
        <div className={ styles.tableWrapper }>
          <Table size="sm" className="align-middle small">
            <thead>        
              <tr>
                { columns.map((column, i) => (
                  <th 
                    key={ i } 
                    className={ 
                      (column.classes ? column.classes : null) + 
                      (column.name.length > 0 ? " pointer" : null) 
                    }
                    onClick={ () => setSortColumn(column) }
                  >
                    { column.name }
                  </th>
                ))}   
              </tr>
            </thead>
            <tbody>
              { datasets.slice().sort(sortColumn ? sortColumn.sort : undefined).map((dataset, i) => (
                <DatasetRow 
                  key={ i }
                  dataset={ dataset } 
                  loaded={ loaded(dataset) }
                  columns={ columns } 
                />
              )) }
            </tbody>
          </Table>
        </div>
      }
    </>
  );
};           