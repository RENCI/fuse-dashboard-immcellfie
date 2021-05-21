import React, { useContext } from "react";
import { Form, Button, Col, Table } from "react-bootstrap";
import { ArrowCounterclockwise, XCircle } from "react-bootstrap-icons";
import * as d3 from "d3";
import { DataContext } from "../../contexts";
import { LabelEdit } from "../label-edit";
import { VegaWrapper } from "../vega-wrapper";
import { phenotypeBarChart } from "../../vega-specs";

const { Row } = Form;

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
    return Array.from(d3.group(filters, filter => filter.phenotype)).reduce((text, phenotype, i) => {
      return text + (i > 0 ? " and " : "") + 
        "(" + nameLabel(phenotype[0]) + ": " + 
        phenotype[1].sort((a, b) => d3.ascending(a.value, b.value)).map(({ value }, i) => {
          return (i > 0 ? " or " : "") + value;
        }).join("") + ")";
    }, "");
  };

  const headers = subgroup.phenotypes.map(({ name }, i) => {
    return <th key={ i }><small>{ nameLabel(name) }</small></th>;
  });

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
      <td key={ i }>
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
      </td>
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
            Count: { subgroup.subjects.length }
          </div>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-secondary" 
            size="sm"
            className="mr-2"
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
      <Table borderless={ true } responsive={ true }>
        <thead>
          <tr>
            { headers }
          </tr>
        </thead>
        <tbody>
          <tr>
            { charts }
          </tr>
        </tbody>
      </Table>
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