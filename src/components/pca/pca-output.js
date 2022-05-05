import { useContext } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { DataContext } from "contexts";
import { OutputDownload } from "components/download";
import { PCAScatterVis } from "./pca-scatter-vis";

const { Header, Title, Body } = Card;

export const PCAOutput = () => {
  const [{ output, subgroups, selectedSubgroups }] = useContext(DataContext);

  const currentSubgroups = selectedSubgroups && selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  return (            
    <Card>
      <Header>
        <Row>
            <Col>
              <Title>PCA Results</Title>
            </Col>
            <Col xs="auto">
              <OutputDownload name="pca_results" />
            </Col>
          </Row>
      </Header>
      <Body>
        { output === null ?
          <>No output data</>
        : output.type !== "PCA" ?
          <>Output data is not of type PCA</>
        : 
          <PCAScatterVis 
            data={ output } 
            subgroups={ currentSubgroups } 
          />
        }
      </Body>
    </Card>
  );
};