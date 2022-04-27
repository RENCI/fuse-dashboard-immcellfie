import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover, Badge } from "react-bootstrap";
import { XCircle, InfoCircle, CaretRightFill, ArrowDownCircleFill } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { DatasetStatusIcon } from "components/dataset-status-icon";
import { SpinnerButton } from "components/spinner-button";
import { DatasetRow } from "./dataset-row";
import { useLoadDataset } from "hooks";
import { api } from "utils/api";
import { getServiceDisplay } from "utils/config-utils";
import { getIdentifier } from "utils/dataset-utils";
import styles from "./dataset-list.module.css";

const missingIndicator = "—";

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

const failed = d => d.status === "failed";
const hasData = d => d.status === "finished" && d.files;
const canDelete = d => !d.results || d.results.length === 0;

const getType = d => d.type;
const getSource = d => getServiceDisplay(d.service);
const getDescription = d => d.description ? d.description : missingIndicator;
const getFinished = d => d.finishedTime ? d.finishedTime.toLocaleString() : null;
const getStatus = d => d.status;

const getTypeDisplay = d => (
  <div style={{ whiteSpace: "nowrap"}}>
    { getType(d) === "result" ? <CaretRightFill className={ `text-warning ${ styles.resultCaret }` } /> : null }
    <Badge     
      className="me-0"
      bg={ 
        getType(d) === "input" ? "info" : 
        getType(d) === "result" ? "warning" : 
        "secondary"
      }
    >
      { getType(d) }
    </Badge>
    { getType(d) === "input" ? <CaretRightFill className={ `text-info ${ styles.inputCaret }` } /> : null }
  </div>
);

const getIdentifierDisplay = d => d.accessionId ? d.accessionId : 
  (getType(d) === "input" && d.files) ? Object.values(d.files).map((file, i) => (
    <div key={ i } className={ styles.noWrap }>
      <small className="text-muted">{ file.file_type === "filetype_dataset_expression" ? "expression" : "properties" }: </small>
      { file.name }
    </div>
  )) :
  missingIndicator

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
  const [{ dataset, propertiesData, result, output }, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    loadDataset(dataset);
  };

  const onDeleteClick = async deleteDataset => {
    if (!canDelete(deleteDataset)) return;

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

  const dataLoading = (dataset && dataset.files.properties && !propertiesData) || (result && !output);
  const isLoading = d => dataLoading && (d === dataset || d === result);
  const isLoaded = d => (d === dataset || d === result) && !isLoading(d);
  

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
      accessor: getIdentifierDisplay,
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
              trigger="click"
              placement="left"
              overlay={ 
                <Popover>
                  <Popover.Header>Error message</Popover.Header>
                  <Popover.Body>{ d.detail }</Popover.Body>
                </Popover>
              }
            >
              <InfoCircle 
                className="ms-1 icon-offset text-secondary" 
                style={{ cursor: "pointer" }}
              />
            </OverlayTrigger>
          </>
        :
          <DatasetStatusIcon dataset={ d } />
      },
      sort: (a, b) => statusOrder[getStatus(a)] - statusOrder[getStatus(b)],
      classes: "text-center"
    },
    {
      name: "Load",
      accessor: d => (
        <div style={{ visibility: (hasData(d) && !failed(d)) ? "visible" : "hidden" }}>
          <SpinnerButton 
            size="sm"
            disabled={ (dataLoading && !isLoading(d)) || isLoaded(d) }
            spin={ isLoading(d) }
            replace={ true }
            onClick={ evt => {
              evt.stopPropagation();
              onLoadClick(d);
            }}
          >
            <ArrowDownCircleFill className="icon-offset" />
          </SpinnerButton>
        </div>
      ),
      classes: "text-center"
    }
  ];

  if (process.env.NODE_ENV === "development") {
    columns.push({
      name: "Remove",
      accessor: d => (
        <div style={{ visibility: d.status === "finished" }}>
          <Button 
            size="sm"
            variant="outline-danger"
            disabled={ dataLoading || !canDelete(d) }
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
    const identifier = getIdentifier(dataset);

    return getType(dataset).match(re) ||
      getSource(dataset).match(re) ||
      (identifier && identifier.match(re)) ||
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
              { filtered.sort(sortColumn ? sortColumn.sort : undefined).map((dataset, i) => {
                const results = dataset.results.slice().sort(sortColumn ? sortColumn.sort : undefined);

                return [dataset, ...results].map(dataset => (
                  <DatasetRow 
                    key={ dataset.id }
                    dataset={ dataset } 
                    loaded={ isLoaded(dataset) }
                    columns={ columns }                     
                    stripe={ i % 2 === 1 }
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