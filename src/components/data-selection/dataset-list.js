import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover, Badge } from "react-bootstrap";
import { XCircle, QuestionCircle } from "react-bootstrap-icons";
import { UserContext, DataContext } from "contexts";
import { TaskStatusIcon } from "components/task-status-icon";
import { SpinnerButton } from "components/spinner-button";
import { DatasetRow } from "./dataset-row";
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

const missingIndicator = "—";

const failed = d => d.status === "failed";
const hasData = d => d.status === "finished" && d.files;

const getType = d => d.type;
const getSource = d => d.service.replace("fuse-provider-", "").replace("fuse-tool-", "");
const getIdentifier = d => d.accessionId ? d.accessionId : 
  (getType(d) === "input" && d.files) ? Object.values(d.files).map(file => file.name).join(", ") :
  missingIndicator;
const getDescription = d => d.description ? d.description : missingIndicator;
const getFinished = d => d.finishedTime ? d.finishedTime.toLocaleString() : null;
const getStatus = d => d.status;

const getTypeDisplay = d => (
  <Badge 
    className={ getType(d) === "result" ? "ms-3" : null }    
    bg={ 
      getType(d) === "input" ? "info" : 
      getType(d) === "result" ? "warning" : 
      "secondary"
    }
  >
    { getType(d) }
  </Badge>
);

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

export const DatasetList = () => {
  const [{ datasets }] = useContext(UserContext);
  const [{ dataset, result }, dataDispatch] = useContext(DataContext);
  const [loading, setLoading] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    if (getType(dataset) === "result") {
      setLoading([dataset.input, dataset]);

      try {
        await loadDataset(dataset.input, dataset);
  
        setLoading([]);
      }
      catch (error) {
        setLoading([]);      
      }
    }
    else {
      setLoading([dataset]);

      try {
        await loadDataset(dataset);
  
        setLoading([]);
      }
      catch (error) {
        setLoading([]);      
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

  const isLoaded = d => d === dataset || d === result;
  const isLoading = d => loading.includes(d);
  const disabled = loading.length > 0;

  const columns = [  
    { 
      name: "Type",
      accessor: getTypeDisplay,
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
    },
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
      ),
      classes: "text-center"
    }
  ];

  if (process.env.NODE_ENV === 'development') {
    columns.push({
      name: "",
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

  const inputs = datasets.filter(({ type }) => type === "input");

  return (
    <>
      { inputs.length > 0 &&
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
              { inputs.sort(sortColumn ? sortColumn.sort : undefined).map((dataset) => {
                const results = dataset.results.slice().sort(sortColumn ? sortColumn.sort : undefined);
                return [dataset, ...results].map((dataset, i) => (
                  <DatasetRow 
                    key={ i }
                    dataset={ dataset } 
                    loaded={ isLoaded(dataset) }
                    columns={ columns } 
                  />
                ));
              })}
            </tbody>
          </Table>
        </div>
      }
    </>
  );
};           