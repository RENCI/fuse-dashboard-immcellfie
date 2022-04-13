import { Form } from "react-bootstrap";

const { Label } = Form;

export const BoldLabel = ({ children }) => {
  return (
    <Label className="mb-0"><h6>{ children }</h6></Label>
  );
};           