import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { EscherWrapper } from "../escher-wrapper";
import "./pathway-vis.css";

const { Group, Control, Label } = Form;

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
  const [map, setMap] = useState(maps[0]);

  const options = maps.map((map, i) => (
    <option 
      key={ i } 
      value={ map }
    >
      { map.replaceAll("_", " ") }
    </option>
  ));

  return (
    <>
      <Group>
        <Label>Select map</Label>
        <Control 
          as="select"
          value={ map }
          onChange={ evt => setMap(evt.target.value) }
        >
          { options }
        </Control>
      </Group>
      <EscherWrapper map={ map ? path + map + ".json" : null } />
    </>
  );
};