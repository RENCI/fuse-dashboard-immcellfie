import { useContext } from "react";
import { Tab, Card, Row, Col, Nav } from "react-bootstrap";
import { DataContext } from "contexts";
import { HierarchyVis } from "components/hierarchy-vis";
import { HeatmapVis } from "components/heatmap-vis";
import { VolcanoVis } from "components/volcano-vis";
import { PathwayVis } from "components/pathway-vis";
import { OutputDownload } from "components/download";
import { useLocalStorage } from "hooks";

const { Header, Title, Body } = Card;
const { Item, Link } = Nav;
const { Container, Content, Pane } = Tab;

export const CellfieOutput = () => {
  const [{ output, subgroups, selectedSubgroups }] = useContext(DataContext);
  const [tab, setTab] = useLocalStorage("CellfieOutputTab", "hierarchy");

  const hierarchy = output ? output.hierarchy : null;
  const tree = output ? output.tree : null;

  const currentSubgroups = selectedSubgroups && selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  const onSelect = tab => {
    setTab(tab);
  };

  return (
    <Card>
      <Container 
        activeKey={ tab }
        mountOnEnter={ true }
        unmountOnExit={ false }
        onSelect={ onSelect }
      >
        <Header>
          <Row>
            <Col>
              <Title>CellFIE Results</Title>
            </Col>
            <Col xs="auto">
              <OutputDownload />
            </Col>
          </Row>
          { hierarchy && 
            <Nav 
              activeKey={ tab }
              variant="tabs" 
              justify={ true }
              className="pointer"
            >
              <Item>
                <Link eventKey="hierarchy">Hierarchy</Link>
              </Item>
              <Item>
                <Link eventKey="volcano">Volcano plot</Link>
              </Item>
              <Item>
                <Link eventKey="heatmap">Heatmap</Link>
              </Item>
              <Item>
                <Link eventKey="escher">Pathway map</Link>
              </Item>
            </Nav>
          }
        </Header>
        <Body>
          { output === null ?
            <>No output data</>
          : output.type !== "CellFIE" ? 
            <>Output data is not of type CellFIE</>
          : 
            <Content>
              <Pane eventKey="hierarchy">
                <HierarchyVis
                  hierarchy={ hierarchy }
                  tree={ tree } 
                  subgroups={ currentSubgroups }
                />
              </Pane>
              <Pane eventKey="volcano">
                <VolcanoVis
                  data={ tree.descendants() }
                  subgroups={ currentSubgroups }
                />
              </Pane>
              <Pane eventKey="heatmap">
                <HeatmapVis
                  data={ tree.descendants() }
                  subgroups={ currentSubgroups }
                />
              </Pane>
              <Pane eventKey="escher">
                <PathwayVis />
              </Pane>
            </Content>
          }
        </Body>
      </Container>
    </Card>
  );  
};