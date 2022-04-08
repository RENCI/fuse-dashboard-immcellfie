import { OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { CheckCircle, ExclamationCircle, QuestionCircle } from "react-bootstrap-icons";
import { bootstrapColor } from "utils/dataset-utils";

const textColor = dataset => `text-${ bootstrapColor(dataset) }`;

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
        dataset.status === "finished" ? <CheckCircle className={ `icon-offset ${ textColor(dataset) }` } /> :
        dataset.status === "failed" ? <ExclamationCircle className={ `icon-offset ${ textColor(dataset) }` } /> :
        dataset.status === "unknown" ? <QuestionCircle className={ `icon-offset ${ textColor(dataset) }` } /> :
        <Spinner animation="border" size="sm" variant={ bootstrapColor(dataset) } />
      }
    </OverlayTrigger>
  );
};           