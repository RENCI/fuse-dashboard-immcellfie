import { useContext } from "react";
import { Table, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { QuestionCircle, StarFill, Star } from "react-bootstrap-icons";
import { DataContext, UserContext } from "../../contexts";
import { TaskStatusIcon } from "../task-status-icon";
import { states } from "./states";
import { api } from "../../utils/api";
import "./download-list.css";

export const DownloadList = ({ state, onSetState, onError }) => {   
  const [{ dataInfo }, dataDispatch  ] = useContext(DataContext);
  const [{ downloads }, userDispatch] = useContext(UserContext);

  const onLoadClick = async download => {
    onSetState(states.loading);
    onError();

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

      onError(error);
    }
  };

  const disabled = state !== states.normal;
  const loaded = download => dataInfo && dataInfo.source.downloadId === download.id;
  const failed = download => download.info && download.info.status === "failed";

  const columns = [    
    {
      name: "",
      accessor: d => failed(d) ? null : loaded(d) ? 
        <StarFill className="text-primary" /> : 
        <Star className="text-primary" />
    },
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
      accessor: d => d.info ? d.info.group_id : null
    },
    { 
      name: "Download ID",
      accessor: d => d.id
    },  
  /*  
    { 
      name: "Created",
      accessor: d => d.info ? d.info.date_created.toLocaleString() : null
    },
  */    
    { 
      name: "Start",
      accessor: d => d.info ? d.info.start_date.toLocaleString() : null
    },  
    { 
      name: "End",
      accessor: d => d.info ? d.info.end_date.toLocaleString() : null
    },
    {
      name: "CellFIE tasks",
      accessor: d => d.tasks.length
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
      }
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
        <div className="tableWrapper">
          <Table size="sm" hover className="align-middle">
            <thead>        
              <tr>
                { columns.map((column, i) => <th key={ i }>{ column.name }</th>)}   
              </tr>
            </thead>
            <tbody>
              { downloads.map((download, i) => (
                <tr key={ i }>
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