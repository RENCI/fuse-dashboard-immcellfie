import { useState, useContext } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { DatasetList } from './dataset-list';
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";
import { states } from "./states";

const { Header, Body, Footer } = Card;

export const DataSelection = () => {  
  const [{ phenotypeData }] = useContext(DataContext);
  const [state, setState] = useState(states.normal);

  const onSetState = state => {
    setState(state);
  };

  return (
    <Card>
      <Header as="h5">
        Input Dataset Selection
      </Header>
      <Body>
        <DatasetList 
          state={ state } 
          onSetState={ onSetState } 
        />
        <Row className="text-center mt-2">
          <Col>
            <LoadImmuneSpace />
          </Col>
          <Col>
            <UploadData />
          </Col>
        </Row>
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
  );  
};           