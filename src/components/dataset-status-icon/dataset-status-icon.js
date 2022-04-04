import { OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { CheckCircle, ExclamationCircle } from "react-bootstrap-icons";

export const DatasetStatusIcon = ({ dataset }) => {
  const variant = 
    dataset.status === "pending" ? "warning" :
    dataset.status === "submitting" ? "primary" :
    dataset.status === "queued" ? "info" :
    dataset.status === "started" ? "success" :    
    "secondary";

  return (
    <OverlayTrigger
      placement="right"
      overlay={ 
        <Tooltip id={ dataset.id }>
          <span>{ dataset.status ? dataset.status : "unknown" }</span>
        </Tooltip>
      }
    >
      {
        dataset.status === "finished" ? <CheckCircle className="icon-offset text-success" /> :
        dataset.status === "failed" ? <ExclamationCircle className="icon-offset text-danger" /> :
        <Spinner animation="border" size="sm" variant={ variant } />
      }
    </OverlayTrigger>
  );
};           