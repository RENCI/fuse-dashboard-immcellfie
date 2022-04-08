import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Card,Row, Col } from "react-bootstrap";
import { ConfigContext, UserContext, DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";
import { Cellfie } from "components/cellfie";
import { PCA } from "components/pca";
import { DataMissing } from "components/data-missing";
import { UserLink, DataLink, AnalyzeLink } from "components/page-links";
import { getServiceName, getServiceDisplay } from "utils/config-utils";

const { Header, Body } = Card;

export const AnalyzeView = () => {
  const [{ tools }] = useContext(ConfigContext);
  const [{ user }] = useContext(UserContext);
  const [{ dataset }] = useContext(DataContext);
  const location = useLocation();

  const toolNames = tools.map(getServiceName);
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
      : !tool || !toolNames.includes(tool) ?
        <ViewWrapper>
          <Card>
            <Header as="h5">
              Select Analysis Tool
            </Header>
            <Body>              
              <Row className="text-center">
                { tools.map(tool => (
                  <Col key={ tool }>
                    <AnalyzeLink tool={ tool } />
                  </Col>
                ))}
              </Row>
            </Body>
          </Card>
        </ViewWrapper>
      : tool === "cellfie" ? <Cellfie />
      : tool === "pca" ? <PCA />
      : 
        <ViewWrapper>
          { getServiceDisplay(tool) } tool not implemented
        </ViewWrapper>
      }
    </>
  );  
};