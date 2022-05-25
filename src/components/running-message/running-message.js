import { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Calculator } from "react-bootstrap-icons";
import { RunningContext } from '../../contexts';
import { durationDisplay } from "utils/time";

const { Header, Title, Body, Footer } = Modal;

export const RunningMessage = () => {
  const [{ tool, runtime }, dispatch] = useContext(RunningContext);

  const onClose = () => {
    dispatch({ type: "clearRunning" });
  };

  const runtimeString = runtime ? durationDisplay(runtime * 1000) : "unknown";
  
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
        Estimated runtime: <b>{ runtimeString }</b>
      </Body>
      <Footer>
        <Button 
          variant="primary"
          onClick={ onClose }
        >
          OK
        </Button>
      </Footer>
    </Modal>
  );
};