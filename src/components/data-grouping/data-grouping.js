import React, { useContext, useState, useEffect} from "react";
import { Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { PlusCircle} from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { Subgroup } from "./subgroup";

const { Title, Body, Footer } = Card;

export const DataGrouping = () => {
  const [{ phenotypes, subgroups }, dataDispatch] = useContext(DataContext);
  const [newAdded, setNewAdded] = useState(false);

  useEffect(() => {
    setNewAdded(false);
  }, []);

  const onAddClick = () => {
    let newName;

    for (let i = subgroups.length; i < subgroups.length * 2; i++) {
      newName = "Subgroup " + i;

      if (!subgroups.find(({ name }) => name === newName)) break;
    }

    dataDispatch({ type: "addSubgroup", name: newName });

    setNewAdded(true);
  };

  return (
    <Card>
      <Body>
        <Title>Data Grouping</Title>
      </Body>
      <ListGroup className="list-group-flush">
        { subgroups.map((subgroup, i, a) => (
          <ListGroupItem key={ subgroup.key }>
            <Subgroup subgroup={ subgroup } index={ i } isNew={ newAdded && i === a.length - 1 } />
          </ListGroupItem>
        ))}
      </ListGroup>
      <Footer>
        <Button
          variant="outline-primary"
          onClick={ onAddClick }
        >
          <PlusCircle className="mb-1 mr-1" />
          Add subgroup
        </Button>
      </Footer>
    </Card>
  );
};

/*

export const DataGrouping = () => {
  const [{ phenotypes, groups }, dataDispatch] = useContext(DataContext);
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

        const phenotype = newState[action.group].find(({ name }) => name === action.phenotype);
        
        if (!phenotype) return state;

        phenotype.value = action.value;

        return newState;
  
      default:
        console.log("Invalid group action");
    }
  }, []);

  console.log(phenotypes);
  console.log(groups);

  const onGroupControlChange = (group, phenotype, value) => {
    dispatch({ type: "setValue", group: group, phenotype: phenotype, value: value })
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const groupControls = (group, i) => (
    <Col key={ i }>
      <h6>Group { i + 1 }</h6>
      { group.map((phenotype, j) => (
        <Group key={ j } controlId={ phenotype.name + "_" + i + "_select" }>
          <Label>
            <small className={ phenotype.value === "Any" ? null : "font-weight-bold" }>
              { nameLabel(phenotype.name) }
            </small>
          </Label>
          <Control 
            as="select"              
            size="sm"
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

*/