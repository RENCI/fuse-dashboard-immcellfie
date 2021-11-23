import React, { useState, useContext, useEffect } from "react";
import { Card, Alert, Row, Col } from "react-bootstrap";
import { DataContext } from "../../contexts";
import { LoadingSpinner } from "../loading-spinner";
import { PhenotypeInfo } from "../phenotype-info";
import { ExpressionInfo } from "../expression-info";
import { CellfieLink, SubgroupsLink, ExpressionLink } from "../page-links";
import { errorUtils } from "../../utils/error-utils";
import { LoadImmuneSpace } from "./load-immunespace";
import { UploadData } from "./upload-data";
import { LoadPractice } from "./load-practice";
import { states } from "./states";

const { Header, Body, Footer } = Card;
const { getErrorMessage } = errorUtils;

export const DataSelection = () => {  
  const [{ dataInfo, phenotypeData, expressionData }] = useContext(DataContext);
  const [state, setState] = useState(states.normal);
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    if (dataInfo && dataInfo.source.name === "upload" && dataInfo.phenotypes.numSubjects !== dataInfo.expression.numSubjects) {
      setErrorMessage(`Number of subjects in phenotype data (${ dataInfo.phenotypes.numSubjects }) does not match number of subjets in expression data (${ dataInfo.expression.numSubjects }). Please upload data with matching subject numbers.`);
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

  const vline = <div style={{ flexGrow: 2, borderLeft: "1px solid #ddd" }} />;

  const separator = (
    <div 
      style={{ height: "100%" }} 
      className="d-flex flex-column align-items-center flex-nowrap"
    >
      { vline }
      <em className="small my-1">OR</em>
      { vline }
    </div>
  );

  return (
    <Card>
      <Header as="h5">
        Data Selection
      </Header>
      <Body>
        <Row>
          <Col>    
            <LoadImmuneSpace 
              state={ state }
              onSetState={ onSetState }
              onError={ onError }
            />
          </Col>
          <Col sm="auto">
            { separator }
          </Col>
          <Col> 
            <h6>Upload data</h6>
            <UploadData
              state={ state }
              onSetState={ onSetState }
              onError={ onError }
            /> 
            <hr />
            <LoadPractice 
              state={ state }
              onSetState={ onSetState }
              onError={ onError }
            />
          </Col>
        </Row>
        { state !== states.normal && 
          <>
            <hr />
            <Row>
              <Col className="text-center">
                <LoadingSpinner />
              </Col>
            </Row>
          </>
        }
        { (phenotypeData || expressionData) && 
          <>
            <hr />
            <Row className="row-eq-height">
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
          </>
        }
        { errorMessage && 
          <>
            <hr />
            <Alert variant="danger">{ errorMessage }</Alert> 
          </>
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