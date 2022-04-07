import { useContext, useState, useEffect} from "react";
import { Row, Col, Card, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { PlusCircle} from "react-bootstrap-icons";
import { DataContext } from "contexts";
import { LoadingSpinner } from "components/loading-spinner";
import { AnalyzeLink } from "components/page-links";
import { Subgroup } from "./subgroup";

const { Header, Body, Footer } = Card;

export const DataGrouping = () => {
  const [{ dataset, propertiesData, subgroups }, dataDispatch] = useContext(DataContext);
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
      { !propertiesData ?  
        <Body>
          { dataset.files.properties ? 
            <LoadingSpinner text="Loading properties data" />
          :
            <>Dataset does not contain properties for creating subgroups</>
          }
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
                <AnalyzeLink />
              </Col>
            </Row>
          </Footer>
        </>
      }
    </Card>
  );
};