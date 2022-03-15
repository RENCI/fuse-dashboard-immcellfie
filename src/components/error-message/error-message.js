import { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationCircleFill } from "react-bootstrap-icons";
import { ErrorContext } from '../../contexts';

const { Header, Title, Body, Footer } = Modal;

const getErrorMessage = error => {
  return !error ? null :
    (typeof error === 'string' || error instanceof String) ? error :
    error.message ? error.message.split(`\n`).map((s, i) => <p key={ i }>{ s }</p>) :
    JSON.stringify(error, Object.getOwnPropertyNames(error));
    //error.toString();
};

export const ErrorMessage = () => {
  const [{ error }, dispatch] = useContext(ErrorContext);

  const onClose = () => {
    dispatch({ type: "clearError" });
  };
  
  const text = getErrorMessage(error);

  return (
    <Modal             
      show={ error !== null }
      backdrop="static"
      keyboard={ false }
    >
      <Header 
        className="text-danger"
      >
        <Title>
          <ExclamationCircleFill /> Error
        </Title>
      </Header>  
      <Body>        
        { text }
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