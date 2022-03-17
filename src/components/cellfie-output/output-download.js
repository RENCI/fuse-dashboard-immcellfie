import { useContext } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";
import { DataContext } from "contexts";
import { useZipLink } from "hooks";

export const OutputDownload = () => {
  const [{ rawOutput }] = useContext(DataContext);
  const outputLink = useZipLink([
    { data: rawOutput && rawOutput.taskInfo , fileName: "taskInfo.csv" },
    { data: rawOutput && rawOutput.score, fileName: "score.csv" },
    { data: rawOutput && rawOutput.scoreBinary, fileName: "score_binary.csv" },
    { data: rawOutput && rawOutput.detailScoring, fileName: "detailScoring.csv" }
  ]);

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
        download="cellfie_results.zip"
        disabled={ !rawOutput }
      >
        <Download />
      </Button>
    </OverlayTrigger>
  );
};