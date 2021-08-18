import React, { useContext, useState } from "react";
import { Form, Card } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { EscherWrapper } from "../escher-wrapper";
import { LoadingSpinner } from "../loading-spinner";
import "./pathway-vis.css";

const { Group, Control, Label } = Form;
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
  const [{ reactionScores }] = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(maps[0]);

  const options = maps.map((map, i) => (
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

  const onLoaded = () => {
    setLoading(false);
  }

  return (
    <>
      <Group>
        <Label>{ loading ? <LoadingSpinner /> : "Select map" }</Label>
        <Control 
          as="select"
          value={ map }
          disabled={ loading }
          onChange={ onMapChange }
        >
          { options }
        </Control>
      </Group>
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