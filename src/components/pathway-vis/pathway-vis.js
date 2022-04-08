import { useContext, useState, useCallback } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import { DataContext } from "contexts";
import { EscherWrapper } from "components/escher-wrapper";
import { LoadingSpinner } from "components/loading-spinner";

const { Group, Label, Control } = Form; 
const { Body } = Card;

const path = "/data/escher/";

const maps = [
  "Amino_Acids_Metabolism",
  "Carbohydrates_Metabolism",
  "Energy_&_Nucleotide_Metabolism",
  "Glycan_Metabolism",
  "Lipids_Metabolism",
  "Vitamin_&_Cofactor_Metabolism"
];

export const PathwayVis = () => {
  const [{ subgroups, selectedSubgroups }] = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(maps[0]);
  const [subgroup, setSubgroup] = useState(selectedSubgroups[1] ? "comparison" : "1");

  const currentSubgroups = selectedSubgroups.map(key => {
    return key !== null ? subgroups.find(subgroup => subgroup.key === key) : null;
  });

  const hasSubgroups = currentSubgroups[1] !== null;

  const reactionScores = !hasSubgroups ? currentSubgroups[0].reactionScores :
    subgroup === "1" ? currentSubgroups[0].reactionScores :
    subgroup === "2" ? currentSubgroups[1].reactionScores :
    currentSubgroups.map(({ reactionScores}) => reactionScores);

  const mapOptions = maps.map((map, i) => (
    <option 
      key={ i } 
      value={ map }
    >
      { map.replaceAll("_", " ") }
    </option>
  ));

  const onMapChange = evt => {
    setMap(evt.target.value);
    setLoading(true);
  }

  const onSubgroupChange = evt => {
    const value = evt.target.value;

    setSubgroup(value);
  };

  const onLoaded = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <Row>
        <Group as={ Col } controlId="mapSelect">
          <Label>{ loading ? <LoadingSpinner /> : "Select map" }</Label>
          <Control 
            size="sm"
            as="select"
            value={ map }
            disabled={ loading }
            onChange={ onMapChange }
          >
            { mapOptions }
          </Control>
        </Group>
        <Group as={ Col } controlId="subgroupSelect">
            <Label size="sm">Subgroup</Label>
            <Control
              size="sm"
              as="select"
              value={ subgroup }
              disabled={ loading }
              onChange={ onSubgroupChange }          
            >
              { hasSubgroups && <option value="comparison">{ currentSubgroups[0].name + " vs. " + currentSubgroups[1].name}</option> }
              <option value="1">{ currentSubgroups[0].name }</option>
              { hasSubgroups && <option value="2">{ currentSubgroups[1].name }</option> }
            </Control>
          </Group>
      </Row>
      <Card>
        <Body className={ "p-0" }>
          <EscherWrapper 
            map={ map ? path + map + ".json" : null } 
            reactionScores={ reactionScores }
            onLoaded={ onLoaded }
          />
        </Body>
      </Card>
    </>
  );
};