import { OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { CheckCircle, ExclamationCircle } from "react-bootstrap-icons";

export const TaskStatusIcon = ({ task }) => {
  const variant = 
    task.status === "pending" ? "warning" :
    task.status === "submitting" ? "primary" :
    task.status === "queued" ? "info" :
    task.status === "started" ? "success" :    
    "secondary";

  return (
    <OverlayTrigger
      placement="right"
      overlay={ 
        <Tooltip id={ task.id }>
          <span className="text-capitalize">{ task.status }</span>
        </Tooltip>
      }
    >
      {
        task.status === "finished" ? <CheckCircle className="icon-offset text-success" /> :
        task.status === "failed" ? <ExclamationCircle className="icon-offset text-danger" /> :
        <Spinner animation="border" size="sm" variant={ variant } />
      }
    </OverlayTrigger>
  );
};           