import React from "react";
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { 
  Home, 
  InputView, 
  SubgroupView,
  OutputView, 
  ExpressionView,
  DownloadView
} from "./views";
import { UserProvider, DataProvider, TaskStatusProvider } from "./contexts";
import { TaskStatus } from "./components/task-status";
import { EmailNav } from "./components/email-nav";

export const App = () => { 
  return (
    <UserProvider>
    <DataProvider>
    <TaskStatusProvider>
      <Router>
        <Container fluid>
          <Navbar fixed="top" bg="dark" variant="dark" expand="md" className="mb-4">
            <Navbar.Brand>
              <img 
                src="/txlogo-cropped-alpha-2.png" 
                alt="translational science logo"
                height="25px"
                className="mr-2 align-text-top"              
              />
              <span className="align-text-bottom">ImmCellFIE Dashboard</span>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav>
                <Nav.Link as={ NavLink } exact to="/">Home</Nav.Link>
                <Nav.Link as={ NavLink } to="/input">Input</Nav.Link>
                <Nav.Link as={ NavLink } to="/cellfie">CellFIE</Nav.Link>
                <Nav.Link as={ NavLink } to="/subgroups">Subgroups</Nav.Link>
                <Nav.Link as={ NavLink } to="/expression-data">Expression data</Nav.Link>
                <Nav.Link as={ NavLink } to="/downloads">Downloads</Nav.Link>
              </Nav>
              <EmailNav />
            </Navbar.Collapse>
          </Navbar>
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/input"><InputView /></Route>
            <Route exact path="/cellfie"><OutputView /></Route>
            <Route exact path="/subgroups"><SubgroupView /></Route>s
            <Route exact path="/expression-data"><ExpressionView /></Route>
            <Route exact path="/downloads"><DownloadView /></Route>
          </Switch>
        </Container>
      </Router>
      <TaskStatus />
    </TaskStatusProvider>
    </DataProvider>    
    </UserProvider>
  ); 
};