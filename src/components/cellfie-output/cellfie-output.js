import React, { useContext } from "react";
import { Tab, Card, Nav } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { HierarchyVis } from "../hierarchy-vis";
import { HeatmapVis } from "../heatmap-vis";
import { VolcanoVis } from "../volcano-vis";
import { PathwayVis } from "../pathway-vis";

const { Header, Title, Body } = Card;
const { Item, Link } = Nav;
const { Container, Content, Pane } = Tab;

export const CellfieOutput = () => {
  const [{ hierarchy, tree, subgroups, selectedSubgroups }] = useContext(DataContext);

  const currentSubgroups = selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  const onSelect = () => {
    const y = window.scrollY;

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.scroll({ left: 0, top: y, behavior: "smooth" });
    }, 0);
  };

  return (
    <>
      { hierarchy && 
        <Card className="mt-4">
          <Container 
            defaultActiveKey="hierarchy"
            mountOnEnter={ true }
            unmountOnExit={ false }
            onSelect={ onSelect }
          >
            <Header>
              <Title>CellFIE Output Visualizations</Title>
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
                  <Link eventKey="volcano">Volcano plot</Link>
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
                <Pane eventKey="volcano">
                  <VolcanoVis
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