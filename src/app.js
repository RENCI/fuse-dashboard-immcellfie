import React from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { 
  Home, 
  UserView,
  InputView, 
  SubgroupView,
  OutputView
} from "views";
import {
  ErrorProvider,
  ConfigProvider,
  UserProvider, 
  DataProvider, 
  ModelProvider,
  ColorProvider
} from "contexts";
import { DatasetMonitor } from "components/dataset-monitor";
import { TaskStatus } from "components/task-status";
import { InfoNav } from "components/info-nav";
import { ErrorMessage } from "components/error-message";

export const App = () => { 
  return (
    <ErrorProvider>
    <ConfigProvider>
    <UserProvider>
    <DataProvider>
    <ModelProvider>
    <ColorProvider>
      <Router><Navbar bg="dark" variant="dark" expand="md" className="mb-3">
            <Nav>
              <Nav.Link as={ NavLink } to="/">
                <Navbar.Brand>
                  <img 
                    src="/txlogo-cropped-alpha-2.png" 
                    alt="translational science logo"
                    height="25px"
                    className="me-2 align-text-top"              
                  />
                  <span className="align-text-bottom">ImmCellFIE Dashboard</span>
                </Navbar.Brand>
              </Nav.Link>
            </Nav>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="me-3">
                <Nav.Link as={ NavLink } to="/user">User</Nav.Link>
                <Nav.Link as={ NavLink } to="/data">Data</Nav.Link>
                <Nav.Link as={ NavLink } to="/analyze">Analyze</Nav.Link>
                <Nav.Link as={ NavLink } to="/subgroups">Subgroups</Nav.Link>
              </Nav>
              <InfoNav />
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
              <div className="me-3">
                <TaskStatus />
              </div>
              <Nav>
                <Nav.Link 
                  href="https://github.com/RENCI/fuse-dashboard-immcellfie/wiki" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <QuestionCircle className="text-info" />
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        <Container fluid>
          
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/user"><UserView /></Route>
            <Route exact path="/data"><InputView /></Route>
            <Route exact path="/analyze"><OutputView /></Route>
            <Route exact path="/subgroups"><SubgroupView /></Route>
            <Redirect to="/" />
          </Switch>
          <ErrorMessage />
        </Container>
      </Router>
      <DatasetMonitor />
    </ColorProvider>
    </ModelProvider>
    </DataProvider>    
    </UserProvider>
    </ConfigProvider>
    </ErrorProvider>
  ); 
};