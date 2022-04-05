import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { Cellfie } from "components/cellfie";
import { PCA } from "components/pca";
import { DataMissing } from "components/data-missing";
import { UserLink, DataLink, AnalyzeLink } from "components/page-links";

export const AnalyzeView = () => {
  const location = useLocation();
  const [{ user }] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);

  const tool = location.hash.slice(1);

  return (
    <>
      { !user ?
        <ViewWrapper>
          <DataMissing message="No user selected" pageLink={ <UserLink /> } /> 
        </ViewWrapper>
      : 
        !dataset ? 
        <ViewWrapper> 
          <DataMissing message="No dataset selected" pageLink={ <DataLink /> } /> 
        </ViewWrapper>
      : !tool ?
        <ViewWrapper>
          <Row>
            <Col>
              <AnalyzeLink tool={ "cellfie" } />
            </Col>
            <Col>
              <AnalyzeLink tool={ "pca" } />
            </Col>
          </Row>
        </ViewWrapper>
      : tool === "cellfie" ? <Cellfie />
      : tool === "pca" ? <PCA />
      : null
      }
    </>
  );  
};