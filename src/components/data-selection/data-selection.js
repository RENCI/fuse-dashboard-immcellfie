import { useContext } from "react";
import { Card, Row, Col, Stack } from "react-bootstrap";
import { DataContext } from "contexts";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "components/page-links";
import { DatasetList } from './dataset-list';
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";

const { Header, Body, Footer } = Card;

export const DataSelection = () => {  
  const [{ phenotypeData }] = useContext(DataContext);

  return (
    <>
      <Card>
        <Header as="h5">
          Input Dataset Selection
        </Header>
        <Body>
          <DatasetList />
        </Body>
        { phenotypeData &&
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
      </Card>
  </>
  );  
};           