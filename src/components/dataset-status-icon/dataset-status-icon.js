import { OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { CheckCircle, ExclamationCircle } from "react-bootstrap-icons";
import { bootstrapColor } from "utils/dataset-utils";

export const DatasetStatusIcon = ({ dataset }) => {
  return (
    <OverlayTrigger
      placement="right"
      overlay={ 
        <Tooltip id={ dataset.id }>
          <span>{ dataset.status }</span>
        </Tooltip>
      }
    >
      {
        dataset.status === "finished" ? <CheckCircle className="icon-offset text-success" /> :
        dataset.status === "failed" ? <ExclamationCircle className="icon-offset text-danger" /> :
        <Spinner animation="border" size="sm" variant={ bootstrapColor(dataset) } />
      }
    </OverlayTrigger>
  );
};           