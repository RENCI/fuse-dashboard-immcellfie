import { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationCircleFill } from "react-bootstrap-icons";
import { ErrorContext } from '../../contexts';

const { Header, Title, Body, Footer } = Modal;

const isString = s => (typeof s === 'string' || s instanceof String);

const splitString = s => s.split(`\n`).map((s, i) => <p key={ i }>{ s }</p>);

const getErrorMessage = error => {
  if (!error) {
    return null;
  }
  else if (isString(error)) {
    return error;
  }
  else if (error instanceof Error) {
    return (
      <>
        { isString(error.message) && 
          <><b>message:</b>{ splitString(error.message) }</> 
        }
        { isString(error.description) &&
          <><b>description:</b>{ splitString(error.description) }</> 
        }
      </>
    );
  }
  else {
    return error;
  }
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
          <ExclamationCircleFill /> { error && error.name ? error.name : "Error" }
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