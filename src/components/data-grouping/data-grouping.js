import React, { useContext, useState, useEffect} from "react";
import { Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { PlusCircle} from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { Subgroup } from "../subgroup";

const { Title, Body, Footer } = Card;

export const DataGrouping = () => {
  const [{ subgroups }, dataDispatch] = useContext(DataContext);
  const [newAdded, setNewAdded] = useState(false);

  useEffect(() => {
    setNewAdded(false);
  }, []);

  const onAddClick = () => {
    dataDispatch({ type: "addSubgroup" });

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
            <Subgroup subgroup={ subgroup } isNew={ newAdded && i === a.length - 1 } />
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