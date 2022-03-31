import { useContext } from "react";
import { DataContext } from "contexts";
import { ViewWrapper } from "components/view-wrapper";

export const PCA = () => {
  const [{ pcaOutput }] = useContext(DataContext);

console.log(pcaOutput);

  return (        
    <ViewWrapper>
      <pre>{ JSON.stringify(pcaOutput, null, 2) }</pre>
    </ViewWrapper>
  );
};