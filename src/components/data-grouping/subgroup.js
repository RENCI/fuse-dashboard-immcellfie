import { useContext } from "react";
import { Button, Row, Col } from "react-bootstrap";
import { ArrowCounterclockwise, XCircle } from "react-bootstrap-icons";
import { group, ascending } from "d3-array";
import { DataContext } from "../../contexts";
import { LabelEdit } from "../label-edit";
import { VegaWrapper } from "../vega-wrapper";
import { phenotypeBarChart } from "../../vega-specs";
import styles from "./subgroup.module.css";

export const Subgroup = ({ all, subgroup, isNew }) => {
  const [, dataDispatch] = useContext(DataContext);

  const editable = subgroup.key > 0;

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", key: subgroup.key, name: name });
  };

  const onValueSelect = (phenotype, evt) => {
    if (!evt.item) return;

    const value = evt.item && evt.item.datum ? evt.item.datum.value : null;

    if (value === null) {
      dataDispatch({ type: "clearSubgroupFilters", key: subgroup.key, phenotype: phenotype });
    }   
    else {
      dataDispatch({ type: "toggleSubgroupFilter", key: subgroup.key, phenotype: phenotype, value: value });
    }
  };

  const onResetClick = () => {
    dataDispatch({ type: "resetSubgroup", key: subgroup.key });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", key: subgroup.key });
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const filterText = filters => {
    return Array.from(group(filters, filter => filter.phenotype)).reduce((text, phenotype, i) => {
      const pheno = (
        <span key={ i }>{ i > 0 ? <span className="font-weight-bold"> and </span> : null }
          (
          { nameLabel(phenotype[0]) }:
          { phenotype[1].sort((a, b) => ascending(a.value, b.value)).map(({ value }, i) => {
            return <span key={ i }>{ i > 0 ? <span className="font-weight-bold"> or </span> : null } { value }</span>;
          })}
          )
        </span>
      );

      return [...text, pheno];
    }, []);
  };

  const charts = subgroup.phenotypes.map((phenotype, i) => {    
    const allPhenotype = all.phenotypes[i];

    const filters = subgroup.filters.filter(filter => filter.phenotype === phenotype.name);    
    const values = filters.map(({ value }) => value);

    const data = allPhenotype.values.map(value => ({...value, subgroup: "all" }))
      .concat(phenotype.values.map(value => {
        return {
          ...value, 
          subgroup: "subgroup",
          selected: values.includes(value.value)
        };
      }));

    return (
      <Col 
        key={ i } 
        className="text-center"
        xs="auto"
      >
        <small>{ nameLabel(phenotype.name) }</small>
        <div className={ styles.subgroupWrapper }>
          <VegaWrapper
            options={{
              actions: false,
              renderer: "svg"
            }}
            spec={ phenotypeBarChart }
            data={ data }            
            signals={[
              { name: "interactive", value: editable },
              { name: "numeric", value: phenotype.numeric }
            ]}
            eventListeners={ editable ? [{ type: "click", callback: evt => onValueSelect(phenotype.name, evt) }] : [] }
            spinner={ false }
          />
        </div>
      </Col>
    );    
  });

  return (
    <div>
      <Row className="align-items-center">
        <Col>
          <LabelEdit     
            subgroup={ subgroup } 
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
    </div>
  );
};           