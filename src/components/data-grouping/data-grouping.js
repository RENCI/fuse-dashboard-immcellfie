import { useContext, useState, useEffect} from "react";
import { Row, Col, Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { PlusCircle} from "react-bootstrap-icons";
import { DataContext } from "contexts";
import { Subgroup } from "./subgroup";
import { CellfieLink } from "components/page-links";

const { Header, Body, Footer } = Card;

export const DataGrouping = () => {
  const [{ phenotypes, subgroups }, dataDispatch] = useContext(DataContext);
  const [newAdded, setNewAdded] = useState(false);  

  console.log(phenotypes);
  console.log(subgroups);

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
      { phenotypes.length === 0 ? 
      <Body>
        <>No properties data loaded for creating subgroups</>
        </Body>
      : 
        <>
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
              <Col className="text-end">
                <CellfieLink />
              </Col>
            </Row>
          </Footer>
        </>
      }
    </Card>
  );
};