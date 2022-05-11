import { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Calculator } from "react-bootstrap-icons";
import { RunningContext } from '../../contexts';

const { Header, Title, Body, Footer } = Modal;

export const RunningMessage = () => {
  const [{ tool, time }, dispatch] = useContext(RunningContext);

  const onClose = () => {
    dispatch({ type: "clearRunning" });
  };
  
  return (
    <Modal             
      show={ tool !== null }
      backdrop="static"
      keyboard={ false }
      onHide={ onClose }
    >
      <Header 
        className="text-success"
        closeButton
      >
        <Title>
          <Calculator /> Running new { tool } analysis
        </Title>
      </Header>  
      <Body>        
        Estimated run time: <b>{ time }</b>
      </Body>
      <Footer>
        <Button 
          variant="primary"
          onClick={ onClose }
        >
          Close
        </Button>
      </Footer>
    </Modal>
  );
};