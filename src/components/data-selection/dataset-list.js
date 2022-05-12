import { useContext, useState, useRef, useEffect } from "react";
import { Table, Button, OverlayTrigger, Popover, Badge, Modal } from "react-bootstrap";
import { XCircle, InfoCircle, CaretRightFill, ArrowDownCircleFill, SendSlash, ZoomIn } from "react-bootstrap-icons";
import { UserContext, DataContext, ErrorContext } from "contexts";
import { DatasetStatusIcon } from "components/dataset-status-icon";
import { SpinnerButton } from "components/spinner-button";
import { LabelEdit } from "components/label-edit";
import { DatasetRow } from "./dataset-row";
import { useLoadDataset } from "hooks";
import { api } from "utils/api";
import { getServiceDisplay } from "utils/config-utils";
import { getIdentifier, isActive } from "utils/dataset-utils";
import styles from "./dataset-list.module.css";

const { Header, Title, Body, Footer } = Modal;

const txscienceEmail = "txscience@lists.renci.org";

const missingIndicator = "—";

// Replace circular references
const replacer = (key, value) => {
  switch (key) {
    case "input":
      return value.id;

    case "results":
      return value.map(({ id }) => id);

    default:
      return value;
  }
};

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
  missingIndicator;

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

const getElapsedTime = (d, now) => {
  const pad = n => n.toString().padStart(2, "0");

  const elapsed = now - d.createdTime;

  if (elapsed < 0) return "-:--";

  let s = Math.floor(elapsed / 1000);
  let m = Math.floor(s / 60);
  const h = Math.floor(m / 60);

  s = s % 60;
  m = m % 60;

  let t = h > 0 ? h + "h" : "";
  if (h > 0 || m > 0) t += (h > 0 ? pad(m) : m) + "m"
  t += (h > 0 || m > 0 ? pad(s) : s) + "s";

  return t;
};

export const DatasetList = ({ filter, showFailed }) => {
  const [{ user, datasets }, userDispatch] = useContext(UserContext);
  const [{ dataset, propertiesData, result, output }, dataDispatch] = useContext(DataContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [sortColumn, setSortColumn] = useState(null);
  const [now, setNow] = useState(new Date());
  const [details, setDetails] = useState(null);
  const loadDataset = useLoadDataset();
  const timer = useRef(null);

  // Timer for active datasets
  const hasActive = datasets.filter(isActive).length > 0;

  if (hasActive && !timer.current) {
    timer.current = setInterval(() => {
      setNow(new Date());
    }, 1000);
  }
  else if (!hasActive && timer.current) {
    clearInterval(timer.current);
    timer.current = null;
  }

  // Clean up timer
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, [timer]);

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
  const isLoaded = d => ((dataset && d.id === dataset.id) || (result && d.id === result.id)) && !isLoading(d);
  

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
      accessor: d => (
        <LabelEdit 
          label={ getDescription(d) }
          size="sm"
          onChange={ description => console.log(description) }// NEED TO CALL API
        />
      ),
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
          <>
            <DatasetStatusIcon dataset={ d } />
            { !isActive(d) ? null :
              <div className="small text-muted">{ getElapsedTime(d, now) }</div>
            }
          </>
      },
      sort: (a, b) => statusOrder[getStatus(a)] - statusOrder[getStatus(b)],
      classes: "text-center"
    },
    {
      name: "Details",
      accessor: d => (
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={ () => setDetails(d) }
        >
          <ZoomIn className="icon-offset" />
        </Button>
      ),
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
              onLoadClick(d);
            }}
          >
            <ArrowDownCircleFill className="icon-offset" />
          </SpinnerButton>
        </div>
      ),
      classes: "text-center"
    },
    {
      name: "Remove",
      accessor: d => {
        const subject = 'ImmCellFIE dataset removal request';
        const newLine = "%0D%0A";
        const body = `User ${ user } requests removal of dataset ${ d.id }${ newLine }${ newLine}Please indicate reason below:`;
      
        return (
          <Button 
            size="sm"
            variant="outline-primary"
            href={ `mailto:${ txscienceEmail }?subject=${ subject }&body=${ body }` }
          >
            <SendSlash className="icon-offset" />
          </Button>
        );
      },
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

  const applyFailed = ({ status }) => showFailed || status !== "failed";

  const inputs = datasets.filter(({ type }) => type === "input").filter(applyFailed);

  const re = new RegExp(filter, "i");
  const filterDataset = dataset => {
    if (!filter) return true;

    const identifier = getIdentifier(dataset);

    return getType(dataset).match(re) ||
      getSource(dataset).match(re) ||
      (identifier && identifier.match(re)) ||
      getDescription(dataset).match(re) ||
      getFinishedDisplay(dataset).match(re) ||
      getStatus(dataset).match(re);
  };

  const filtered = inputs.reduce((filtered, input) => {
    if (filterDataset(input)) {
      filtered.push({
        ...input,
        results: input.results.filter(applyFailed)
      });
    }
    else {
      const results = input.results.filter(filterDataset).filter(applyFailed);

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
          <Modal
            show={ details }
            backdrop="static"
            keyboard={ false }
            onHide={ () => setDetails(null) }
          >
            <Header closeButton>
              <Title>
                Dataset Details
              </Title>
            </Header>  
            <Body>
              <pre>
                { JSON.stringify(details, replacer, 2) }
              </pre>
            </Body>
          </Modal>
        </div>        
      }
    </>
  );
};           