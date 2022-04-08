import { useContext, useState } from 'react';
import { useHistory } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle } from "react-bootstrap-icons";
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
  
  return (
    <Modal     
      show={ dataset }  
      backdrop="static"
      keyboard={ false }
    >
      <Header 
        className="text-success"
      >
        <Title>
          <CheckCircle /> Dataset Ready
        </Title>
      </Header>  
      <Body>        
        { dataset && 
          <>
            <div><small className="text-muted">type:</small> { dataset.type }</div>
            <div><small className="text-muted">source:</small> { getServiceDisplay(dataset.service) }</div>
            { identifier && <div><small className="text-muted">identifier:</small> { identifier }</div> }
            <div><small className="text-muted">description:</small> { dataset.description }</div>
          </>
        }
      </Body>
      <Footer>
        <Button 
          variant="primary"
          disabled={ loading }
          onClick={ () => onLoad(dataset) }
        >
          Load
        </Button>
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