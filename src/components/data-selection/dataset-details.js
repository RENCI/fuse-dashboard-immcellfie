import { Modal } from "react-bootstrap";

const { Header, Title, Body } = Modal;

// Replace circular references
const replacer = (key, value) => {
  switch (key) {
    case "input":
      return value.id;

    case "results":
      return value.map(({ id }) => id);

    default:
      return value;
  }
};

export const DatasetDetails = ({ dataset, onHide }) => {
  return (
    <Modal
      show={ dataset }
      backdrop="static"
      keyboard={ false }
      onHide={ onHide }
    >
      <Header closeButton>
        <Title>
          Dataset Details
        </Title>
      </Header>  
      <Body>
        <pre>
          { JSON.stringify(dataset, replacer, 2) }
        </pre>
      </Body>
    </Modal>        
  );
};           