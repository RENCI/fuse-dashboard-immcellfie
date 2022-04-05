import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover, Badge } from "react-bootstrap";
import { XCircle, QuestionCircle } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { DatasetStatusIcon } from "components/dataset-status-icon";
import { SpinnerButton } from "components/spinner-button";
import { DatasetRow } from "./dataset-row";
import { useLoadDataset } from "hooks";
import { api } from "utils/api";
import styles from "./dataset-list.module.css";

const statusOrder = [
  "pending",
  "unknown",
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

export const DatasetList = ({ filter }) => {
  const [{ datasets }, userDispatch] = useContext(UserContext);
  const [{ dataset, result }, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [loading, setLoading] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    try {
      if (dataset.input) {
        setLoading([dataset.input, dataset]);
      }
      else {
        setLoading([dataset]);
      }

      await loadDataset(dataset);

      setLoading([]);
    }
    catch (error) {
      setLoading([]);      
    }
  };

  const onDeleteClick = async deleteDataset => {
    try {
      const result = await api.deleteDataset(deleteDataset.id);

      if (result.status === "deleted") {
        if (deleteDataset === dataset) {
          dataDispatch({ type: "clearData" });
        }

        userDispatch({ type: "removeDataset", dataset: deleteDataset });
      }
      else {
        throw new Error(result);
      }
    }
    catch (error) {
      errorDispatch({ type: "setError", error: error }) ;
    }
  };

  const isLoaded = d => d === dataset || d === result;
  const isLoading = d => loading.includes(d);
  const disabled = loading.length > 0;

  // XXX: useMemo here, or figure out how to move outside of component?
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
            <DatasetStatusIcon dataset={ d } />
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
          <DatasetStatusIcon dataset={ d } />
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

  if (process.env.NODE_ENV === "development") {
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

  const re = new RegExp(filter, "i");
  const filterDataset = dataset => {
    return getType(dataset).match(re) ||
      getSource(dataset).match(re) ||
      getIdentifier(dataset).match(re) ||
      getDescription(dataset).match(re) ||
      getFinishedDisplay(dataset).match(re) ||
      getStatus(dataset).match(re);
  };

  const filtered = !filter ? inputs : 
    inputs.reduce((filtered, input) => {
      if (filterDataset(input)) {
        filtered.push(input);
      }
      else {
        const results = input.results.filter(filterDataset);

        if (results.length > 0) {
          filtered.push({
            ...input,
            results: results
          });
        }
      }
      
      return filtered;
    }, []);

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
                    { sortColumn && column.name === sortColumn.name && <span className="ms-2">🠫</span> }
                  </th>
                ))}   
              </tr>
            </thead>
            <tbody>
              { filtered.sort(sortColumn ? sortColumn.sort : undefined).map((dataset) => {
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