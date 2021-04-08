import React, { useContext, useReducer, useEffect} from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { DataContext } from "../../contexts";

const { Title, Body } = Card;
const { Label, Group, Switch, Control } = Form;

const excludedPhenotypes = [
  "participant_id",
  "biosample_accession"
];

const timeSort = {
  Hours: 0,
  Days: 1,
  Months: 2,
  Years: 3
};

export const DataGrouping = () => {
  const [{ output, phenotypes }, dataDispatch] = useContext(DataContext);
  const [ state, dispatch ] = useReducer((state, action) => {
    switch (action.type) {
      case "initialize":
        const initializeGroup = phenotypeValues => (
          phenotypeValues.map(({ name, values }) => ({
            name: name,
            values: [...values],
            value: "Any"
          }))
        );

        return [
          initializeGroup(action.phenotypeValues),
          initializeGroup(action.phenotypeValues)
        ];

      case "setValue":               
        const newState = [...state];

        console.log(newState);
        console.log(action);

        const phenotype = newState[action.group].find(({ name }) => name === action.phenotype);
        
        if (!phenotype) return state;

        phenotype.value = action.value;

        return newState;
  
      default:
        console.log("Invalid group action");
    }
  }, []);

  useEffect(() => {
    const phenotypeValues = !phenotypes ? [] :
      phenotypes.columns
        .filter(column => !excludedPhenotypes.includes(column))
        .map(column => {
          const values = Array.from(phenotypes.reduce((values, row) => {
            values.add(row[column]);
            return values;
          }, new Set()));

          const numeric = values.reduce((numeric, value) => numeric && !isNaN(value), true);

          if (numeric) {
            values.forEach((value, i, values) => values[i] = +values[i]);
            values.sort((a, b) => a - b);
          }
          else if (column === "study_time_collected_unit") {
            values.sort((a, b) => timeSort[a] - timeSort[b]);
          }
          else {
            values.sort();
          }

          return {
            name: column,
            values: values
          };
        });

    dispatch({ type: "initialize", phenotypeValues: phenotypeValues });
  }, [phenotypes])



  const onGroupControlChange = (group, phenotype, value) => {
    dispatch({ type: "setValue", group: group, phenotype: phenotype, value: value })
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const groupControls = (group, i) => (
    <Col key={ i }>
      <h6>Group { i }</h6>
      { group.map((phenotype, j) => (
        <Group key={ j } controlId={ phenotype.name + "_" + i + "_select" }>
          <Label><small className="capitalize">{ nameLabel(phenotype.name) }</small></Label>
          <Control 
            as="select"
            size="sm"
            className={ phenotype.value === "Any" ? null : "border-success" }
            value={ phenotype.value }
            onChange={ evt => onGroupControlChange(i, phenotype.name, evt.target.value )}
          >
            <option>Any</option>
            <option disabled>──────────</option>
            { phenotype.values.map((value, k) => (
              <option key={ k }>{ value }</option>
            ))}
          </Control>
        </Group>      
      )) }
    </Col>
  );

  return (
    <Card>
      <Body>
        <Title>Data Grouping</Title>
        <Row>
          { state.map(groupControls) }
        </Row>
      </Body>
    </Card>
  );
};           