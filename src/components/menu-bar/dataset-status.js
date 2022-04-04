import { useContext } from "react";
import { UserContext } from "contexts";
import { DatasetStatusIcon } from "components/dataset-status-icon";
import { bootstrapColor, isActive } from "utils/dataset-utils";

export const DatasetStatus = () => {
  const [{ datasets }] = useContext(UserContext);

  const counts = datasets.filter(dataset => isActive(dataset)).reduce((counts, { status }) => {
    if (!counts[status]) counts[status] = 0;

    counts[status]++;

    return counts;
  }, {});

  return (
    <div>
      { Object.entries(counts).map(([status, count]) => (
        <span key={ status } className="me-2 no-wrap">
          <DatasetStatusIcon dataset={{ status }} />
          <b className={ `text-${ bootstrapColor({ status: status }) } small ms-1`}>{ count }</b>
        </span>
      ))}
    </div>
  );
};