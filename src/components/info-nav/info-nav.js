import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";
import { getName } from "../../utils/dataset";

export const InfoNav = () => {
  const [{ user },] = useContext(UserContext);
  const [{ dataset },] = useContext(DataContext);

  const name = dataset ? getName(dataset) : "None loaded";

  return (
    user && 
    <div className="text-info small">
      <Row>
        <Col>
          <div>User</div>
          <div><b>{ user }</b></div>
        </Col>
        <Col>
          <div>Input dataset</div>
          <div><b>{ name }</b></div>
        </Col>
      </Row>      
    </div>
  );
};           