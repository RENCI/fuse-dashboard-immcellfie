import { useContext, useMemo } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import { DataContext } from "contexts";
import { getName } from "utils/dataset-utils";
import { useZipLink } from "hooks";

export const OutputDownload = () => {
  const [{ dataset, result, output, outputFiles }] = useContext(DataContext);

  const files = useMemo(() => (
    !outputFiles ? null :
    Object.entries(outputFiles).map(([key, value]) => ({ data: value, fileName: `${ key }.csv` }))
  ), [outputFiles]);

  const outputLink = useZipLink(files);

  const datasetName = outputFiles ? getName(dataset) : null;
  const resultName = outputFiles ? getName(result) : null;

  const fileName = resultName ? `${ resultName }.csv` : `${ datasetName }_${ output.type }_result.zip`;

  return (
    <OverlayTrigger
      placement="left"
      overlay={ 
        <Tooltip>Download results</Tooltip>
      }
    >
      <Button
        variant="link"
        href={ outputLink }
        download={ fileName }
        disabled={ !outputFiles }
      >
        <Download />
      </Button>
    </OverlayTrigger>
  );
};