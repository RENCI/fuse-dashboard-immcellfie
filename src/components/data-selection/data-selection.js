import { useContext } from "react";
import { Card, Row, Col, Stack } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { UserContext, DataContext } from "contexts";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "components/page-links";
import { DatasetList } from './dataset-list';
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";

const { Header, Body, Footer } = Card;

export const DataSelection = () => {  
  const [{ datasets }] = useContext(UserContext);
  const [{ propertiesData }] = useContext(DataContext);

  const pending = datasets.filter(({ status }) => status === "pending");

  return (
    <>
      <Card>
        <Header as="h5">
          Input Dataset Selection
        </Header>
        <Body>
          <DatasetList />
        </Body>
        { propertiesData &&
          <Footer>
            <Row className="text-center">
              <Col>
                <CellfieLink />
              </Col>
              <Col>
                <SubgroupsLink />
              </Col>
              <Col>
                <ExpressionLink />
              </Col>
            </Row>
          </Footer>
        }
      </Card>
      <Card className="mt-3">
        <Header as="h5">
          Add New Datasets
        </Header>
        <Body>
          <Stack direction="horizontal" gap={ 2 }>
            <LoadImmuneSpace />
            <UploadData />
          </Stack>
        </Body>
        { pending.length > 0 && 
          <Footer>
            <div className="d-flex flex-row align-items-center">
              <ExclamationTriangle className="text-warning me-3" size={ 32 }/>
              <div>
                <div>{ pending.length } pending datset{ pending.length > 1 ? "s" : null}</div> 
                <small className="text-muted">Do not navigate away from the ImmCellFIE Dashboard while datasets are pending or they will be cancelled</small>                      
              </div>
            </div>
          </Footer>
        }
      </Card>
  </>
  );  
};           