import { useContext } from "react";
import { DataContext } from "contexts";

export const PCAOutput = () => {
  const [{ output }] = useContext(DataContext);

  return (            
    <>
      { output === null ?
        <>No output data</>
      : output.type !== "PCA" ?
        <>Output data is not of type PCA</>
      : 
        <pre style={{ height: 500, overflowY: "auto" }}>
          { JSON.stringify(output, null, 2) }
        </pre>
      }
    </>
  );
};