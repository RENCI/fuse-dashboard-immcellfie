import { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "../../contexts";

export const EmailNav = () => {
  const [{ email },] = useContext(UserContext);
  const [{ dataInfo },] = useContext(DataContext);

  console.log(dataInfo);

  const name = dataInfo ?
    dataInfo.source.name === "ImmuneSpace" ? dataInfo.phenotypes.name :
    dataInfo.source.name === "upload" ? dataInfo.phenotypes.name :
    dataInfo.source.name : null;

  return (
    email && 
    <div className="text-info small ms-3">
      <Row>
        <Col style={{ whiteSpace: "nowrap" }}>
          <div>User: <b>{ email }</b></div>
        </Col>
        <Col style={{ whiteSpace: "nowrap" }}>
          { dataInfo && dataInfo.phenotypes ? 
            <>Data: <b>{ name }</b></> : 
            <>No data loaded</>
          }
        </Col>
      </Row>      
    </div>
  );
};           