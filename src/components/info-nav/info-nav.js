import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";

export const InfoNav = () => {
  const [{ email },] = useContext(UserContext);
  const [{ dataInfo },] = useContext(DataContext);

  const name = dataInfo ?
    dataInfo.source.name === "ImmuneSpace" ? dataInfo.phenotypes.name :
    dataInfo.source.name === "upload" ? dataInfo.phenotypes.name :
    dataInfo.source.name : null;

  return (
    email && 
    <div className="text-info small">
      <Row>
        <Col>
          <div>User</div>
          <div><b>{ email }</b></div>
        </Col>
        <Col>
          <div>Input data</div>
          <div><b>{ name ? name : "None loaded" }</b></div>
        </Col>
      </Row>      
    </div>
  );
};           