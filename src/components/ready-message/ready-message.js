import { useContext, useState } from 'react';
import { useHistory } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { ReadyContext, UserContext } from '../../contexts';
import { useLoadDataset } from "hooks";
import { getServiceName, getServiceDisplay } from "utils/config-utils";
import { getIdentifier } from "utils/dataset-utils";

const { Header, Title, Body, Footer } = Modal;

export const ReadyMessage = () => {
  const [{ ready }, dispatch] = useContext(ReadyContext);
  const [{ datasets }] = useContext(UserContext);
  const [loading, setLoading] = useState();
  const loadDataset = useLoadDataset();
  const history = useHistory();

  const onLoad = async dataset => {
    setLoading(true);

    await loadDataset(dataset);

    setLoading(false);

    dispatch({ type: "remove", id: dataset.id });

    if (dataset.service.includes("fuse-tool-")) {
      history.push(`/analyze#${ getServiceName(dataset.service) }`);
    }
  };

  const onClose = dataset => {
    dispatch({ type: "remove", id: dataset.id });
  };

  const id = ready.length > 0 ? ready[0] : null;
  const dataset = id !== null ? datasets.find(dataset => dataset.id === id) : null;

  const identifier = dataset && getIdentifier(dataset);

  const Label = ({ children }) => <small className="text-muted">{ children }</small>;
  
  return (
    <Modal     
      show={ dataset }  
      backdrop="static"
      keyboard={ false }
      onHide={ () => onClose(dataset) }
    >
      <Header 
        className={ dataset && dataset.status === "failed" ? "text-danger" : "text-success" }
        closeButton
      >
        <Title>
          { dataset && dataset.status === "failed" ? 
            <><XCircle /> Dataset Failed</>
          :
            <><CheckCircle /> Dataset Ready</>
          }
        </Title>
      </Header>  
      <Body>        
        { dataset && 
          <>
            <div><Label>type:</Label> { dataset.type }</div>
            <div><Label>source:</Label> { getServiceDisplay(dataset.service) }</div>
            { identifier && <div><Label>identifier:</Label> { identifier }</div> }
            <div><Label>description:</Label> { dataset.description }</div>
            { dataset.status === "failed" && dataset.detail && 
              <div>
                <Label>detail:</Label>
                <code>{ dataset.detail }</code>
              </div> 
            }
          </>
        }
      </Body>
      <Footer>
        { dataset && dataset.status !== "failed" &&
          <Button 
            variant="primary"
            disabled={ loading }
            onClick={ () => onLoad(dataset) }
          >
            Load
          </Button>
        }
        <Button 
          variant="primary"
          disabled={ loading }
          onClick={ () => onClose(dataset) }
        >
          Close
        </Button>
      </Footer>
    </Modal>
  );
};