import { useContext, useState } from "react";
import { Card, Row, Col, Stack, Alert, InputGroup, FormControl, Button, DropdownButton, Dropdown } from "react-bootstrap";
import { ExclamationTriangle, X } from "react-bootstrap-icons";
import { ConfigContext, UserContext, DataContext } from "contexts";
import { AnalyzeLink, SubgroupsLink } from "components/page-links";
import { DatasetList } from './dataset-list';
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";
import { getServiceName } from "utils/config-utils";

const { Header, Body, Footer } = Card;

export const DataSelection = () => {  
  const [{ providers }] = useContext(ConfigContext);
  const [{ datasets }] = useContext(UserContext);
  const [{ dataset, propertiesData, result }] = useContext(DataContext);
  const [filter, setFilter] = useState("");
  const [showFailed, setShowFailed] = useState(false);

  const onFilterChange = evt => {
    setFilter(evt.target.value.trim());
  };

  const onClearFilter = () => {
    setFilter("");
  };

  const onShowFailedDatasetsClick = () => {
    setShowFailed(!showFailed);
  };

  const pending = datasets.filter(({ status }) => status === "pending");

  return (
    <Stack gap={ 3 }>
      { pending.length > 0 && 
        <Alert variant="warning">
          <div className="d-flex flex-row align-items-center">
            <ExclamationTriangle className="text-warning me-3" size={ 32 }/>
            <div>
              <div>{ pending.length } pending datset{ pending.length > 1 ? "s" : null}</div> 
              <small className="text-muted">Do not navigate away from the ImmCellFie Dashboard while datasets are pending or they will be cancelled</small>                      
            </div>
          </div>
        </Alert>
      }

      { datasets.length > 0 &&
        <Card>
          <Header as="h5" className="d-flex align-items-center">
            <div className="flex-grow-1">
              Dataset Selection
            </div>
            <div>
              <InputGroup size="sm">
                <FormControl
                  placeholder="Filter datasets..."
                  value={ filter }
                  onChange={ onFilterChange }
                />
                <Button 
                  variant="outline-secondary"
                  disabled={ filter === "" }
                  onClick={ onClearFilter }
                >
                  <X className="icon-offset" />
                </Button>
                <DropdownButton
                  variant="outline-secondary"
                  id="show-failed-dropdown"
                  title=""
                >
                  <Dropdown.Item 
                    as="button"
                    onClick={ onShowFailedDatasetsClick }
                  >
                    { showFailed ? "Hide" : "Show" } failed datasets
                  </Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </div>
          </Header>
          <Body>
            <DatasetList 
              filter={ filter === "" ? null : filter } 
              showFailed={ showFailed } 
            />
          </Body>
          { dataset &&
            <Footer>
              <Row className="text-center">
                { propertiesData &&
                  <Col>
                    <SubgroupsLink />
                  </Col>
                }
                <Col>
                  <AnalyzeLink tool={ result ? getServiceName(result.service) : null } />
                </Col>                
              </Row>
            </Footer>
          }
        </Card>
      }

      <Card>
        <Header as="h5">
          Add New Datasets
        </Header>
        <Body>
          <Stack direction="horizontal" gap={ 2 }>
            { providers.map((provider, i) => (
              provider === "fuse-provider-immunespace" ? <LoadImmuneSpace key={ i } /> :
              provider === "fuse-provider-upload" ? <UploadData key={ i } /> : 
              null
            ))}
          </Stack>
        </Body>
      </Card>
  </Stack>
  );  
};           