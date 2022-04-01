import { useContext } from "react";
import { DataContext } from "contexts";
import { PCAScatterVis } from "./pca-scatter-vis";

export const PCAOutput = () => {
  const [{ output, subgroups, selectedSubgroups }] = useContext(DataContext);

  const currentSubgroups = selectedSubgroups && selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  console.log(subgroups);
  console.log(selectedSubgroups);
  console.log(currentSubgroups);

  return (            
    <>
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
    </>
  );
};