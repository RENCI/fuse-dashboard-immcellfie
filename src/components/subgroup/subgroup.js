import React, { useContext } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { ArrowCounterclockwise, XCircle } from "react-bootstrap-icons";
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

    dataDispatch({ type: "setSubgroupFilter", key: subgroup.key, phenotype: phenotype, value: value });
  };

  const onResetClick = () => {
    dataDispatch({ type: "resetSubgroup", key: subgroup.key });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", key: subgroup.key });
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const controls = subgroup.phenotypes.map((phenotype, i) => {    
    const allPhenotype = all.phenotypes[i];

    const filter = subgroup.filters.find(filter => filter.phenotype === phenotype.name);
    const value = filter ? filter.value : "none";

    const data = allPhenotype.values.map(value => ({...value, subgroup: "all" }))
      .concat(phenotype.values.map(value => ({...value, subgroup: "subgroup" })));

      console.log(data);

    return (
      <Col key={ i } xs={ 2 } className="text-center">
        <small>{ nameLabel(phenotype.name) }</small>
        <VegaWrapper
          options={{
            actions: false,
            renderer: "svg"
          }}
          spec={ phenotypeBarChart }
          data={ data }            
          signals={ editable ? 
            [{ name: "value", value: value }] : 
            [{ name: "interactive", value: false }] 
          }
          eventListeners={ editable ? 
            [{ type: "click", callback: evt => onValueSelect(phenotype.name, evt) }] : 
            [] 
          }
          spinner={ false }
        />
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
      <Row>
        { controls }
      </Row>
    </div>
  );
};           