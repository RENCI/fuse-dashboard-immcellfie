import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { XCircle, QuestionCircle } from "react-bootstrap-icons";
import { UserContext, DataContext } from "contexts";
import { TaskStatusIcon } from "components/task-status-icon";
import { SpinnerButton } from "components/spinner-button";
import { DatasetRow } from "./dataset-row";
import { useLoadDataset } from "hooks";
//import { api } from "utils/api";
import styles from "./dataset-list.module.css";

const providerString = "fuse-provider";

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

const missingIndicator = "—";

const failed = d => d.status === "failed";
const hasData = d => d.status === "finished" && d.files;

const getType = d => d.type;
const getSource = d => d.provider.replace("fuse-provider-", "").replace("fuse-tool-", "");
const getIdentifier = d => d.accessionId ? d.accessionId : 
  (getType(d) === "input" && d.files) ? Object.values(d.files).map(file => file.name).join(", ") :
  missingIndicator;
const getDescription = d => d.description ? d.description : missingIndicator;
const getFinished = d => d.finishedTime ? d.finishedTime.toLocaleString() : null;
const getFinishedDisplay = d => {
  if (!d.finishedTime) return missingIndicator;

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
  const [{ dataset }, dataDispatch] = useContext(DataContext);
  const [loading, setLoading] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    if (getType(dataset) === "result") {
      const input = datasets.find(({ id }) => id === dataset.parameters.dataset);

      if (!input) return;

      setLoading(input);

      try {
        await loadDataset(input);
  
        setLoading(null);
      }
      catch (error) {
        setLoading(null);      
      }
    }
    else {
      setLoading(dataset);

      try {
        await loadDataset(dataset);
  
        setLoading(null);
      }
      catch (error) {
        setLoading(null);      
      }
    }
  };

  const onDeleteClick = async deleteDataset => {
    if (deleteDataset === dataset) {
      dataDispatch({ type: "clearData" });
    }

    // const success = api.deleteDataset(deleteDataset.id);

    // XXX: Check return and update datasets
  };

  const isLoaded = d => d === dataset;
  const isLoading = d => d === loading;
  const disabled = loading !== null;

  const columns = [  
    {
      name: "",
      accessor: d => (
        <div style={{ visibility: (hasData(d) && !failed(d)) ? "visible" : "hidden" }}>
          <SpinnerButton 
            size="sm"
            disabled={ disabled || isLoaded(d) }
            spin={ isLoading(d) }
            replace={ true }
            onClick={ evt => {
              evt.stopPropagation();
              onLoadClick(d);
            }}
          >
            Load
          </SpinnerButton>
        </div>
      )
    },
    { 
      name: "Type",
      accessor: getType,
      sort: (a, b) => getType(a).localeCompare(getType(b))
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
        return failed(d) && d.detail ?
          <>
            <TaskStatusIcon task={ d } />
            <OverlayTrigger
              placement="left"
              overlay={ 
                <Popover>
                  <Popover.Header>Error message</Popover.Header>
                  <Popover.Body>{ d.detail }</Popover.Body>
                </Popover>
              }
            >
              <QuestionCircle className="ms-1 icon-offset text-secondary" />
            </OverlayTrigger>
          </>
        :
          <TaskStatusIcon task={ d } />
      },
      sort: (a, b) => statusOrder[getStatus(a)] - statusOrder[getStatus(b)],
      classes: "text-center"
    } 
  ];

  if (process.env.NODE_ENV === 'development') {
    columns.push({
      name: "Delete",
      accessor: d => (
        <div style={{ visibility: d.status === "finished" }}>
          <Button 
            size="sm"
            variant="outline-danger"
            disabled={ disabled }
            onClick={ evt => {
              evt.stopPropagation();
              onDeleteClick(d);
            }}
          >
            <XCircle className="icon-offset" />
          </Button>
        </div>
      ),
      classes: "text-center"
    });
  }

  const inputDatasets = datasets.filter(({ provider }) => provider.includes(providerString));
  inputDatasets.sort(sortColumn ? sortColumn.sort : undefined);

  return (
    <>
      { inputDatasets.length > 0 &&
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
                  loaded={ isLoaded(dataset) }
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