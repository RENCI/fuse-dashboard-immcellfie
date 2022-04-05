import { useContext } from "react";
import { Card, Row, Col, Stack, Alert } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { ConfigContext, UserContext, DataContext } from "contexts";
import { CellfieLink, SubgroupsLink } from "components/page-links";
import { DatasetList } from './dataset-list';
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";

const { Header, Body, Footer } = Card;

export const DataSelection = () => {  
  const [{ providers }] = useContext(ConfigContext);
  const [{ datasets }] = useContext(UserContext);
  const [{ propertiesData }] = useContext(DataContext);

  const pending = datasets.filter(({ status }) => status === "pending");

  return (
    <Stack gap={ 3 }>
      { pending.length > 0 && 
        <Alert variant="warning">
          <div className="d-flex flex-row align-items-center">
            <ExclamationTriangle className="text-warning me-3" size={ 32 }/>
            <div>
              <div>{ pending.length } pending datset{ pending.length > 1 ? "s" : null}</div> 
              <small className="text-muted">Do not navigate away from the ImmCellFIE Dashboard while datasets are pending or they will be cancelled</small>                      
            </div>
          </div>
        </Alert>
      }

      { datasets.length > 0 &&
        <Card>
          <Header as="h5">
            Dataset Selection
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
              </Row>
            </Footer>
          }
        </Card>
      }

      <Card>
        <Header as="h5">
          Add New Datasets
        </Header>
        <Body>
          <Stack direction="horizontal" gap={ 2 }>
            { providers.map((provider, i) => (
              provider === "fuse-provider-immunespace" ? <LoadImmuneSpace key={ i } /> :
              provider === "fuse-provider-upload" ? <UploadData key={ i } /> : 
              null
            ))}
          </Stack>
        </Body>
      </Card>
  </Stack>
  );  
};           