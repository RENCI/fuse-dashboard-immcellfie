import React, { useContext } from "react";
import { Tab, Card, Nav } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { HierarchyVis } from "../hierarchy-vis";
import { HeatmapVis } from "../heatmap-vis";
import { VolcanoVis } from "../volcano-vis";
import { PathwayVis } from "../pathway-vis";
import { useLocalStorage } from "../../hooks";

const { Header, Title, Body } = Card;
const { Item, Link } = Nav;
const { Container, Content, Pane } = Tab;

export const CellfieOutput = () => {
  const [{ hierarchy, tree, subgroups, selectedSubgroups }] = useContext(DataContext);
  const [tab, setTab] = useLocalStorage("CellfieOutputTab", "hierarchy");

  const currentSubgroups = selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  const onSelect = tab => {
    setTab(tab);
  };

  return (
    <>
      { hierarchy && 
        <Card>
          <Container 
            activeKey={ tab }
            mountOnEnter={ true }
            unmountOnExit={ false }
            onSelect={ onSelect }
          >
            <Header>
              <Title>CellFIE Output Visualizations</Title>
              <Nav 
                activeKey={ tab }
                variant="tabs" 
                justify={ true }
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
            </Body>
          </Container>
        </Card>
      }
    </>
  );  
};