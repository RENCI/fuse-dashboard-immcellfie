import React, { useContext } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { DataContext } from "../../contexts";
import { LabelEdit } from "./label-edit";
import { VegaWrapper } from "../vega-wrapper";
import { phenotypeBarChart } from "../../vega-specs";

const { Row, Group, Label, Control } = Form;

export const Subgroup = ({ subgroup, index, isNew }) => {
  const [{ phenotypes }, dataDispatch] = useContext(DataContext);

  const onNameChange = name => {
    dataDispatch({ type: "setSubgroupName", index: index, name: name });
  };

  const onCloseClick = () => {
    dataDispatch({ type: "removeSubgroup", index: index });
  };

  const onControlChange = (name, value) => {
    console.log(name, value);
  };

  const nameLabel = name => (name[0].toUpperCase() + name.substring(1)).replace(/_/gi, " ");

  const controls = phenotypes.map((phenotype, i) => {
    const pheno = subgroup.phenotypes.find(({ name }) => name === phenotype.name);
    const value = pheno ? pheno.value : "Any";

    console.log(phenotype);

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
        />
      </Col>
    );
/*    
    return (
      <Col key={ i }>
        <Group>
          <Label>
            <small className={ value === "Any" ? null : "font-weight-bold" }>
              { nameLabel(phenotype.name) }
            </small>
          </Label>
          <Control 
            as="select"              
            size="sm"
            disabled={ index === 0 }
            value={ value }
            onChange={ evt => onControlChange(i, phenotype.name, evt.target.value )}
          >
            <option>Any</option>
            <option disabled>──────────</option>
            { phenotype.values.map((value, k) => (
              <option key={ k }>{ value.value }</option>
            ))}
          </Control>
        </Group>
      </Col>      
    );
*/    
  });

  return (
    <Form>
      <Row>
        <Col>
          <LabelEdit     
            subgroup={ subgroup } 
            isNew={ isNew }
            onChange={ index > 0 ? onNameChange : null }
          />
        </Col>
        { index > 0 &&
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