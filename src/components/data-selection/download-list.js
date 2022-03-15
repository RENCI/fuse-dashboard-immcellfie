import { useContext, useState } from "react";
import { Table, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { DataContext, UserContext, ErrorContext } from "../../contexts";
import { TaskStatusIcon } from "../task-status-icon";
import { states } from "./states";
import { api } from "../../utils/api";
import styles from "./download-list.module.css";

export const DownloadList = ({ state, onSetState }) => {   
  const [{ dataInfo }, dataDispatch  ] = useContext(DataContext);
  const [{ downloads }, userDispatch] = useContext(UserContext);
  const [, errorDispatch] = useContext(ErrorContext);
  const [sortColumn, setSortColumn] = useState(null);

  const onLoadClick = async download => {
    onSetState(states.loading);

    userDispatch({ type: "clearActiveTask" });
    dataDispatch({ type: "clearOutput" });
    dataDispatch({ 
      type: "setDataInfo", 
      source: { name: "ImmuneSpace", downloadId: download.id },
      phenotypes: { name: download.info.group_id },
      expression: { name: download.info.group_id }
    });

    try {
      const phenotypes = await api.getImmuneSpacePhenotypes(download.id);

      dataDispatch({ type: "setPhenotypes", data: phenotypes });

      onSetState(states.normal);
    }
    catch (error) {
      console.log(error);

      errorDispatch({ type: "setError", error: error});
    }
  };

  const disabled = state !== states.normal;
  const loaded = download => dataInfo && dataInfo.source.downloadId === download.id;
  const failed = download => download.info && download.info.status === "failed";
  const status = download => download.info && download.info.status === "failed" ? "failed" : download.status;
  const statusValue = status => status === "failed" ? 0 : 1;
  const hasStart = download => download.info && download.info.start_date !== null;
  const hasEnd = download => download.info && download.info.end_date !== null;

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
      name: "Group label",
      accessor: d => d.info ? d.info.group_id : null,
      sort: (a, b) => a.info && b.info ? a.info.group_id.localeCompare(b.info.group_id) : a.info ? -1 : b.info ? 1 : 0
    },
    { 
      name: "Dataset ID",
      accessor: d => d.id,
      sort: (a, b) => a.id.localeCompare(b.id)
    },  
  /*  
    { 
      name: "Created",
      accessor: d => d.info ? d.info.date_created.toLocaleString() : null
    },
  */    
    { 
      name: "Start",
      accessor: d => hasStart(d) ? d.info.start_date.toLocaleString() : null,
      sort: (a, b) => hasStart(a) && hasStart(b) ? b.info.start_date - a.info.start_date : hasStart(a) ? -1 : hasStart(b) ? 1 : 0
    },  
    { 
      name: "End",
      accessor: d => hasEnd(d) ? d.info.end_date.toLocaleString() : null,
      sort: (a, b) => hasEnd(a) && hasEnd(b) ? b.info.end_date - a.info.end_date : hasEnd(a) ? -1 : hasEnd(b) ? 1 : 0
    },
    {
      name: "CellFIE runs",
      accessor: d => d.tasks.length,
      sort: (a, b) => b.tasks.length - a.tasks.length
    },
    { 
      name: "Status",
      accessor: d => {
        const task = d.info && d.info.status === "failed" ? d.info : d;
  
        return task.status === "failed" ?
          <>
            <TaskStatusIcon task={ task } />
            <OverlayTrigger
              placement="left"
              overlay={ 
                <Popover>
                  <Popover.Header>Error message</Popover.Header>
                  <Popover.Body>{ task.stderr }</Popover.Body>
                </Popover>
              }
            >
              <QuestionCircle className="ms-2 text-secondary" />
            </OverlayTrigger>
          </>
        :
          <TaskStatusIcon task={ task } />
      },
      sort: (a, b) => statusValue(status(b)) - statusValue(status(a))
    },
/*    
    {
      name: "",
      accessor: d => (
        <OverlayTrigger
          overlay={
            <Tooltip>
              Delete download
            </Tooltip>
          }
        >
          <Button 
            size="sm"
            variant="outline-danger"
          >
            <XCircle />
          </Button>                
        </OverlayTrigger>
      )
    }
*/    
  ];

  return (
    <>
      { downloads.length > 0 &&
        <div className={ styles.tableWrapper }>
          <Table size="sm" hover className="align-middle">
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
              { downloads.slice().sort(sortColumn ? sortColumn.sort : undefined).map((download, i) => (
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