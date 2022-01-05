import React, { useContext, useState, useEffect} from "react";
import { Row, Col, Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { PlusCircle} from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { Subgroup } from "../subgroup";
import { CellfieLink } from "../page-links";

const { Header, Footer } = Card;

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
      <Header as="h5">
        Data Grouping
      </Header>
      <ListGroup className="list-group-flush">
        { subgroups.map((subgroup, i, a) => (
          <ListGroupItem key={ subgroup.key }>
            <Subgroup 
              all={ subgroups[0] }
              subgroup={ subgroup } 
              isNew={ newAdded && i === a.length - 1 } 
            />
          </ListGroupItem>
        ))}
      </ListGroup>
      <Footer>
        <Row>
          <Col>
            <Button
              variant="outline-primary"
              onClick={ onAddClick }
            >
              <PlusCircle className="mb-1 me-1" />
              Add subgroup
            </Button>
          </Col>
          <Col className="text-right">
            <CellfieLink />
          </Col>
        </Row>
      </Footer>
    </Card>
  );
};