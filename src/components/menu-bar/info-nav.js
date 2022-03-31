import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { getName } from "utils/dataset-utils";

export const InfoNav = () => {
  const [{ user },] = useContext(UserContext);
  const [{ dataset, result },] = useContext(DataContext);

  const name = dataset => {
    if (!dataset) return "none loaded";

    let name = getName(dataset);

    return name ? name : "no name";
  };

  return (
    user && 
    <div className="text-info small">
      <Row>
        <Col>
          <div>User</div>
          <div><b>{ user }</b></div>
        </Col>
        <Col>
          <div>Input</div>
          <div><b>{ name(dataset) }</b></div>
        </Col>
        <Col>
          <div>Result</div>
          <div><b>{ name(result) }</b></div>
        </Col>
      </Row>      
    </div>
  );
};           