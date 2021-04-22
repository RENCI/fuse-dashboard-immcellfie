import React, { useContext, useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { LabelEdit } from "./label-edit";
import { VegaWrapper } from "../vega-wrapper";
import { phenotypeBarChart } from "../../vega-specs";

const { Row } = Form;

export const Subgroup = ({ subgroup, isNew }) => {
  const [, dataDispatch] = useContext(DataContext);

  const editable = subgroup.key > 0;

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", key: subgroup.key, name: name });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", key: subgroup.key });
  };

  const onValueSelect = (phenotype, evt) => {
    if (!evt.item) return;

    const value = evt.item && evt.item.datum ? evt.item.datum.value : null;

    dataDispatch({ type: "setSubgroupFilter", key: subgroup.key, phenotype: phenotype, value: value });
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const controls = subgroup.phenotypes.map((phenotype, i) => {    
    //const pheno = subgroup.phenotypes.find(({ name }) => name === phenotype.name);
    //const value = values[phenotype.name];

    const filter = subgroup.filters.find(filter => filter.phenotype === phenotype.name);
    const value = filter ? filter.value : "none";

    return (
      <Col key={ i } xs={ 2 } className="text-center">
        <small>{ nameLabel(phenotype.name) }</small>
        <VegaWrapper
          options={{
            actions: false,
            renderer: "svg"
          }}
          spec={ phenotypeBarChart }
          data={ phenotype.values }
          signals={ editable ? 
            [{ name: "value", value: value }] : 
            [{ name: "interactive", value: false }] 
          }
          eventListeners={editable ? 
            [{ type: "click", callback: evt => onValueSelect(phenotype.name, evt) }] : 
            [] 
          }
          spinner={ false }
        />
      </Col>
    );    
  });

  return (
    <Form>
      <Row>
        <Col>
          <LabelEdit     
            subgroup={ subgroup } 
            isNew={ isNew }
            onChange={ editable ? onNameChange : null }
          />
        </Col>
          <div>
            Count: { subgroup.subjects.length }
          </div>
        <Col>
        </Col>
        { editable &&
          <Col xs="auto">
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={ onCloseClick }
            >
              <XCircle className="mb-1" />
            </Button>
          </Col>
        }
      </Row>
      <Row>
        { controls }
      </Row>
    </Form>
  );
};           