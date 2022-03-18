import { useContext, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { TaskStatusIcon } from "components/task-status-icon";
import { states } from "./states";
import { getName } from "utils/dataset-utils";
import { useLoadDataset } from "hooks";
import styles from "./dataset-list.module.css";

const statusOrder = [
  "pending",
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
const hasData = d => d.files;

const getSource = d => d.provider.replace("fuse-provider-", "");
const getDescription = d => d.description;
const getStart = d => d.createdTime.toLocaleString();
const getEnd = d => d.finishedTime ? d.finishedTime.toLocaleString() : null;
const getAnalyses = d => 0;
const getStatus = d => d.status;

export const DatasetList = () => {
  const [{ datasets }] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);
  const [state, setState] = useState(states.normal);
  const [sortColumn, setSortColumn] = useState(null);
  const loadDataset = useLoadDataset();

  const onLoadClick = async dataset => {
    setState(states.loading);

    try {
      loadDataset(dataset);

      setState(states.normal);
    }
    catch (error) {
      setState(states.normal);
    }
  };

  const loaded = d => d === dataset;
  const disabled = state !== states.normal;

  const columns = [  
    {
      name: "",
      accessor: d => (
        !hasData(d) || failed(d) ? null :
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
      name: "Source",
      accessor: getSource,
      sort: (a, b) => getSource(a).localeCompare(getSource(b))
    },
    { 
      name: "Name",
      accessor: getName,
      sort: (a, b) => getName(a).localeCompare(getName(b))
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
      name: "Start",
      accessor: getStart,
      sort: (a, b) => {
        console.log(getStart(a), getStart(b));
        console.log(getStart(a) > getStart(b));
        return getStart(b) - getStart(a);
      }
    },  
    { 
      name: "End",
      accessor: getEnd,
      sort: (a, b) => getEnd(b) - getEnd(a)
    },
    {
      name: "Analyses",
      accessor: getAnalyses,
      sort: (a, b) => getAnalyses(b) - getAnalyses(a),
      classes: "text-center"
    },
    { 
      name: "Status",
      accessor: d => {
        // XXX: Currently not receiving any error message. Revisit if this becomes available.
        /*        
        return !failed(d) ?
          <>
            <TaskStatusIcon task={ d } />
            <OverlayTrigger
              placement="left"
              overlay={ 
                <Popover>
                  <Popover.Header>Error message</Popover.Header>
                  <Popover.Body>{ d.stderr }</Popover.Body>
                </Popover>
              }
            >
              <QuestionCircle className="ms-2 text-secondary" />
            </OverlayTrigger>
          </>
        :
        */
        return <TaskStatusIcon task={ d } />
      },
      sort: (a, b) => statusOrder[getStatus(a)] - statusOrder[getStatus(b)],
      classes: "text-center"
    } 
  ];

  return (
    <>
      { datasets.length > 0 &&
        <div className={ styles.tableWrapper }>
          <Table size="sm" hover className="align-middle small">
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
                  </th>
                ))}   
              </tr>
            </thead>
            <tbody>
              { datasets.slice().sort(sortColumn ? sortColumn.sort : undefined).map((download, i) => (
                <tr 
                  key={ i } 
                  className={ loaded(download) ? `${ styles.active } border-primary rounded` : null }
                >
                  { columns.map((column, i) => (
                    <td 
                      key={ i } 
                      className={ column.classes }
                    >
                      { column.accessor(download) }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      }
    </>
  );
};           