import { useContext } from "react";
import { Button, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ArrowCounterclockwise, XCircle, Diagram3 } from "react-bootstrap-icons";
import { group, ascending } from "d3-array";
import { DataContext } from "contexts";
import { LabelEdit } from "components/label-edit";
import { VegaWrapper } from "components/vega-wrapper";
import { propertiesBarChart } from "vega-specs";
import styles from "./subgroup.module.css";

export const Subgroup = ({ all, subgroup, isNew }) => {
  const [, dataDispatch] = useContext(DataContext);

  const editable = subgroup.key > 0;

  const onCreateSubgroups = properties => {
    dataDispatch({ type: "createSubgroups", properties: properties });
  };

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", key: subgroup.key, name: name });
  };

  const onValueSelect = (properties, evt) => {
    if (!evt.item) return;

    const value = evt.item && evt.item.datum ? evt.item.datum.value : null;

    if (value === null) {
      dataDispatch({ type: "clearSubgroupFilters", key: subgroup.key, properties: properties });
    }   
    else {
      dataDispatch({ type: "toggleSubgroupFilter", key: subgroup.key, properties: properties, value: value });
    }
  };

  const onResetClick = () => {
    dataDispatch({ type: "resetSubgroup", key: subgroup.key });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", key: subgroup.key });
  };

  const nameLabel = name => name.length === 0 ? '' : (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const filterText = filters => {
    return Array.from(group(filters, filter => filter.properties)).reduce((text, properties, i) => {
      const pheno = (
        <span key={ i }>{ i > 0 ? <span className="font-weight-bold"> and </span> : null }
          (
          { nameLabel(properties[0]) }:
          { properties[1].sort((a, b) => ascending(a.value, b.value)).map(({ value }, i) => {
            return <span key={ i }>{ i > 0 ? <span className="font-weight-bold"> or </span> : null } { value }</span>;
          })}
          )
        </span>
      );

      return [...text, pheno];
    }, []);
  };

  const charts = subgroup.properties.map((properties, i) => {    
    const allProperties = all.properties[i];

    const filters = subgroup.filters.filter(filter => filter.properties === properties.name);    
    const values = filters.map(({ value }) => value);

    const data = allProperties.values.map(value => ({...value, subgroup: "all" }))
      .concat(properties.values.map(value => {
        return {
          ...value, 
          subgroup: "subgroup",
          selected: values.includes(value.value)
        };
      }));

    return (
      <Col 
        key={ i } 
        className="text-center d-flex flex-column"
        xs="auto"
      >
        <small>{ nameLabel(properties.name) }</small>
        <div className={ styles.subgroupWrapper }>
          <VegaWrapper
            options={{
              actions: false,
              renderer: "svg"
            }}
            spec={ propertiesBarChart }
            data={ data }            
            signals={[
              { name: "interactive", value: editable },
              { name: "numeric", value: properties.numeric }
            ]}
            eventListeners={ editable ? [{ type: "click", callback: evt => onValueSelect(properties.name, evt) }] : [] }
            spinner={ false }
          />
        </div>
        { (!editable && properties.values.length > 1) &&
          <div className="mt-auto">
            <OverlayTrigger
              placement="top"
              overlay={ 
                <Tooltip>Split into subgroups</Tooltip>
              }
            >
              <div className="d-grid px-4">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={ () => onCreateSubgroups(properties) }
                >
                  <Diagram3 className="icon-offset" />
                </Button>
              </div>
            </OverlayTrigger>
          </div> 
        }
      </Col>
    );    
  });

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <LabelEdit     
            label={ subgroup.name } 
            isNew={ isNew }
            onChange={ editable ? onNameChange : null }
          />
        </Col>
        <Col>
          <div>
            Count: { subgroup.samples.length }
          </div>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-secondary" 
            size="sm"
            className="me-2"
            style={{ visibility: !editable ? "hidden" : null }}
            onClick={ onResetClick }
          >
            <ArrowCounterclockwise className="mb-1" />
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            style={{ visibility: !editable ? "hidden" : null }}
            onClick={ onCloseClick }
          >
            <XCircle className="mb-1" />
          </Button>
        </Col>
      </Row>
      <Row>
        { charts }
      </Row>
      <Row>
        <Col>
          <small className="text-muted">
            { filterText(subgroup.filters) }
          </small>
        </Col>
      </Row>
    </>
  );
};           