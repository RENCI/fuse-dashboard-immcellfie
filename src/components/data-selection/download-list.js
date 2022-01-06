import { useState, useContext } from "react";
import { Table, Button, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { QuestionCircle, XLg } from "react-bootstrap-icons";
import { UserContext } from "../../contexts";
import { TaskStatusIcon } from "../task-status-icon";

const columns = [
  { 
    name: "Group Label",
    accessor: d => d.info ? d.info.group_id : null
  },
  { 
    name: "Download ID",
    accessor: d => d.id
  },  
  { 
    name: "Created",
    accessor: d => d.info ? d.info.date_created.toLocaleString() : null
  },  
  { 
    name: "Start",
    accessor: d => d.info ? d.info.start_date.toLocaleString() : null
  },  
  { 
    name: "End",
    accessor: d => d.info ? d.info.end_date.toLocaleString() : null
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
  }
];

export const DownloadList = () => {   
  const [{ downloads }, userDispatch] = useContext(UserContext);

  return (
    <>
      { downloads.length > 0 &&
        <Table size="sm" hover responsive striped className="align-middle mb-0">
          <thead>        
            <tr>
              <th></th>
              { columns.map((column, i) => <th key={ i }>{ column.name }</th>)}   
            </tr>
          </thead>
          <tbody>
            { downloads.map((download, i) => (
              <tr key={ i }>
                <td><Button size="sm">Load</Button></td>
                { columns.map((column, i) => <td key={ i }>{ column.accessor(download) }</td>)}
                <td>
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
                      <XLg className="mb-1" />
                    </Button>                
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      }
    </>
  );
};           