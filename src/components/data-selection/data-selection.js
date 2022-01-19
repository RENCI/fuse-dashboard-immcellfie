import { useState, useContext, useEffect } from "react";
import { Card, Alert, Row, Col, Accordion } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { LoadingSpinner } from "../loading-spinner";
import { PhenotypeInfo } from "../phenotype-info";
import { ExpressionInfo } from "../expression-info";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { errorUtils } from "../../utils/error-utils";
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";
import { LoadExample } from "./load-example";
import { states } from "./states";
import styles from "./data-selection.module.css";

const { Header, Body, Footer } = Card;

const { getErrorMessage } = errorUtils;

export const DataSelection = () => {  
  const [{ dataInfo, phenotypeData, expressionData }] = useContext(DataContext);
  const [state, setState] = useState(states.normal);
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    if (dataInfo && dataInfo.source.name === "upload" && dataInfo.phenotypes.numSamples !== dataInfo.expression.numSamples) {
      setErrorMessage(`Number of samples in phenotype data (${ dataInfo.phenotypes.numSamples }) does not match number of subjects in expression data (${ dataInfo.expression.numSamples }). Please upload data with matching sample numbers.`);
    }
    else {
      setErrorMessage();
    }
  }, [dataInfo]);

  const onError = error => {
    setErrorMessage(getErrorMessage(error));
  };

  const onSetState = state => {
    setState(state);
  };

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <h6>Data source</h6>
        <Accordion>
          <Accordion.Item eventKey='immunespace'>
            <Accordion.Header>
              ImmuneSpace
            </Accordion.Header>
            <Accordion.Body className={ styles.accordionShadow }>
              <LoadImmuneSpace 
                state={ state }
                onSetState={ onSetState }
                onError={ onError }
              />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey='upload'>
            <Accordion.Header>
              Local file upload
            </Accordion.Header>
            <Accordion.Body className={ styles.accordionShadow }> 
              <UploadData
                state={ state }
                onSetState={ onSetState }
                onError={ onError }
              /> 
            </Accordion.Body>
          </Accordion.Item>


          <Accordion.Item eventKey='example'>
            <Accordion.Header>
              Example data
            </Accordion.Header>
            <Accordion.Body className={ styles.accordionShadow }> 
              <LoadExample 
                state={ state }
                onSetState={ onSetState }
                onError={ onError }
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        { state !== states.normal && 
          <Row className="mt-3">
            <Col className="text-center">
              <LoadingSpinner />
            </Col>
          </Row>
        }
        { (phenotypeData || expressionData) && 
          <Row className="row-eq-height mt-3">
            <Col>
              { 
                <ExpressionInfo 
                  source={ dataInfo.source.name }
                  name={ dataInfo.expression.name }
                  data={ expressionData } 
                /> 
              }
            </Col>
            <Col>
              { phenotypeData && 
                <PhenotypeInfo 
                  source={ dataInfo.source.name }
                  name={ dataInfo.phenotypes.name } 
                  data={ phenotypeData } 
                /> 
              }
            </Col>
          </Row>
        }
        { errorMessage && 
          <Alert className="mt-3" variant="danger">{ errorMessage }</Alert> 
        }
      </Body>
      { phenotypeData &&
        <Footer>
          <Row>
            <Col className="text-center">
              <CellfieLink />
            </Col>
            <Col className="text-center">
              <SubgroupsLink />
            </Col>
            <Col className="text-center">
              <ExpressionLink />
            </Col>
          </Row>
        </Footer>
      }
    </Card>
  );  
};           