import React, { useContext } from "react";
import { Tab, Card, Nav } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { VegaWrapper } from "../vega-wrapper";
import { taskHeatmap } from "../../vega-specs";
import { HierarchyVis } from "../hierarchy-vis";
import { HeatmapVis } from "../heatmap-vis";
import { PathwayVis } from "../pathway-vis";

const { Header, Body } = Card;
const { Item, Link } = Nav;
const { Container, Content, Pane } = Tab;

export const CellfieOutput = () => {
  const [{ hierarchy, tree, subgroups, selectedSubgroups }] = useContext(DataContext);

  const currentSubgroups = selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  return (
    <>
      { hierarchy && 
        <Card className="mt-4">
          <Container 
            defaultActiveKey="hierarchy"
            mountOnEnter={ true }
            unmountOnExit={ true }
          >
            <Header>
              <Nav 
                variant="tabs" 
                defaultActiveKey="hierarchy"
                justify={ true }
              >
                <Item>
                  <Link eventKey="hierarchy">Hierarchy</Link>
                </Item>
                <Item>
                  <Link eventKey="heatmap">Heatmap</Link>
                </Item>
                <Item>
                  <Link eventKey="escher">Pathway map</Link>
                </Item>
              </Nav>
            </Header>
            <Body>
              <Content>
                <Pane eventKey="hierarchy">
                  <HierarchyVis
                    hierarchy={ hierarchy }
                    tree={ tree } 
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
            </Body>
          </Container>
        </Card>
      }
    </>
  );  
};