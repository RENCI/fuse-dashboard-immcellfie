import { useContext } from "react";
import { Card } from "react-bootstrap";
import { DataContext } from "contexts";
import { PCAScatterVis } from "./pca-scatter-vis";

const { Header, Body } = Card;

export const PCAOutput = () => {
  const [{ output, subgroups, selectedSubgroups }] = useContext(DataContext);

  const currentSubgroups = selectedSubgroups && selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  return (            
    <Card>
      <Header as="h5">
        PCA Results
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