import { useContext, useState } from 'react';
import { useHistory } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle } from "react-bootstrap-icons";
import { ReadyContext, UserContext } from '../../contexts';
import { useLoadDataset } from "hooks";

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

    if (dataset.service === "fuse-tool-pca") {
      history.push("/analyze#pca");
    }
  };

  const onClose = dataset => {
    dispatch({ type: "remove", id: dataset.id });
  };

  const id = ready.length > 0 ? ready[0] : null;
  const dataset = id !== null ? datasets.find(dataset => dataset.id === id) : null;
  
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
        { dataset && dataset.id }
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