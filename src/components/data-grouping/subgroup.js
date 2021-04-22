import React, { useContext, useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { LabelEdit } from "./label-edit";
import { VegaWrapper } from "../vega-wrapper";
import { phenotypeBarChart } from "../../vega-specs";

const { Row, Group, Label, Control } = Form;

export const Subgroup = ({ subgroup, index, isNew }) => {
  const [{ phenotypes }, dataDispatch] = useContext(DataContext);

  const [values, setValues] = useState({});

  const editable = index > 0;

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", index: index, name: name });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", index: index });
  };

  const onValueSelect = (phenotype, evt) => {
    if (!evt.item) return;

    const newValues = {...values};
    newValues[phenotype] = evt.item && evt.item.datum ? evt.item.datum.value : "none";

    setValues(newValues);
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const controls = phenotypes.map((phenotype, i) => {    
    const pheno = subgroup.phenotypes.find(({ name }) => name === phenotype.name);
    const value = values[phenotype.name];

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