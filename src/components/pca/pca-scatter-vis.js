import { useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import { ResizeWrapper } from "components/resize-wrapper";
import { VegaWrapper } from "components/vega-wrapper";
import { VegaTooltip } from "components/vega-tooltip";
import { DetailVis } from "components/detail-vis";
import { SelectedList } from "components/selected-list";
import { pcaScatterPlot } from "vega-specs";

export const PCAScatterVis = ({ data, subgroups }) => {
  //const hasSubgroups = subgroups[1] !== null;

  const pcaData = useMemo(() => { 
    return data.points.map(d => (
      { x: d[0], y: d[1] }
    ));
/*    
    return data.filter(node => node.depth > 0).map(node => {
      const foldChange = node.data.scoreFoldChange;
      const pValue = node.data.scorePValue;

      return {
        name: node.data.name,
        foldChange: foldChange,
        logFoldChange: log(foldChange),
        pValue: pValue,
        logPValue: -log(pValue),
        depth: node.depth,
        category: pValue > significanceLevel ? "not significant" :
          foldChange >= foldChangeThreshold ? "up" :  
          foldChange <= 1 / foldChangeThreshold ? "down" :
          "not significant",
        selected: node.data.selected,
        data: node.data
      };
    });
  }, [data, significanceLevel, foldChangeThreshold]);  
*/
}, [data]); 

  //const subtitle = subgroups[1] && (subgroups[0].name + " vs. " + subgroups[1].name);

  //const subgroup = "comparison";

  const subtitle = "";

  return (
    <>
      { /*
      <div className="mb-4">
        <Row>
          <Col>
            <SelectedList 
              nodes={ data } 
              subgroup="comparison"
              subgroupName={ [subgroups[0].name, subgroups[1].name] }
            />
          </Col>
        </Row>
      </div>
      */}
      <ResizeWrapper 
        useWidth={ true }
        useHeight={ true }
        minWidth={ 600 }
        aspectRatio={ 1.6 }
      >
        <VegaWrapper
          spec={ pcaScatterPlot } 
          data={ pcaData }
          signals={[
            { name: "subtitle", value: subtitle }
          ]}
          tooltip={ null /*
            <VegaTooltip>
              <DetailVis 
                subgroup={ subgroup } 
                subgroupName={ [subgroups[0].name, subgroups[1].name] } 
              />
            </VegaTooltip>            
          */}
        />           
      </ResizeWrapper>
    </>
  );
};           