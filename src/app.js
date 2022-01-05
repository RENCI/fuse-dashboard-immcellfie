import React from "react";
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { 
  Home, 
  UserView,
  InputView, 
  SubgroupView,
  OutputView, 
  ExpressionView,
  DownloadView
} from "./views";
import { UserProvider, DataProvider, ModelProvider } from "./contexts";
import { TaskStatus } from "./components/task-status";
import { EmailNav } from "./components/email-nav";

export const App = () => { 
  return (
    <UserProvider>
    <DataProvider>
    <ModelProvider>
      <Router>
        <Container fluid>
          <Navbar fixed="top" bg="dark" variant="dark" expand="md" className="mb-4">
            <Nav>
              <Nav.Link as={ NavLink } to="/">
                <Navbar.Brand>
                  <img 
                    src="/txlogo-cropped-alpha-2.png" 
                    alt="translational science logo"
                    height="25px"
                    className="mr-2 align-text-top"              
                  />
                  <span className="align-text-bottom">ImmCellFIE Dashboard</span>
                </Navbar.Brand>
              </Nav.Link>
            </Nav>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav>
                <Nav.Link as={ NavLink } to="/user">User</Nav.Link>
                <Nav.Link as={ NavLink } to="/input">Input</Nav.Link>
                <Nav.Link as={ NavLink } to="/cellfie">CellFIE</Nav.Link>
                <Nav.Link as={ NavLink } to="/subgroups">Subgroups</Nav.Link>
                <Nav.Link as={ NavLink } to="/expression-data">Expression data</Nav.Link>
                <Nav.Link as={ NavLink } to="/downloads">Downloads</Nav.Link>
              </Nav>
              <div className="ml-5"><EmailNav /></div>
              <div className="ml-2"><TaskStatus /></div>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
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
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/user"><UserView /></Route>
            <Route exact path="/input"><InputView /></Route>
            <Route exact path="/cellfie"><OutputView /></Route>
            <Route exact path="/subgroups"><SubgroupView /></Route>s
            <Route exact path="/expression-data"><ExpressionView /></Route>
            <Route exact path="/downloads"><DownloadView /></Route>
          </Switch>
        </Container>
      </Router>
    </ModelProvider>
    </DataProvider>    
    </UserProvider>
  ); 
};