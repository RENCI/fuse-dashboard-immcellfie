import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import { 
  Home, 
  SubgroupView,
  InputView, 
  OutputView, 
  AdminView, 
  UserView 
} from "./views";
import { DataProvider } from "./contexts";

export const App = () => { 
  return (
    <DataProvider>
      <Router>
        <Container>
          <Navbar bg="dark" variant="dark" expand="md" className="mb-4">
            <Navbar.Brand>
              <img 
                src="/txlogo-cropped-alpha-2.png" 
                alt="translational science logo"
                height="25px"
                className="mr-2"              
              />
              <span className="align-middle">ImmCellFIE Dashboard</span>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav>
                <Nav.Link as={ Link } to="/">Home</Nav.Link>
                <Nav.Link as={ Link } to="/subgroups">Subgroups</Nav.Link>
                <Nav.Link as={ Link } to="/cellfie">CellFIE</Nav.Link>
                <Nav.Link as={ Link } to="/expression-data">Expression data</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
              <Nav>
                <NavDropdown title={ <PersonCircle /> } alignRight>
                  <NavDropdown.Item as={ Link } to="/admin">Administration</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={ Link } to="/user">User profile</NavDropdown.Item>
                </NavDropdown> 
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/subgroups"><SubgroupView /></Route>
            <Route exact path="/cellfie"><OutputView /></Route>
            <Route exact path="/expression-data"><InputView /></Route>
            <Route exact path="/admin"><AdminView /></Route>
            <Route exact path="/user"><UserView /></Route>
          </Switch>
        </Container>
      </Router>
    </DataProvider>
  ); 
};