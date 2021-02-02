import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Home, InputView, OutputView } from "./views";

export const App = () => { 
  return (
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
              <Nav.Link as={ Link } to="/input">Input Data</Nav.Link>
              <Nav.Link as={ Link } to="/output">Output Data</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route exact path="/"><Home /></Route>
          <Route exact path="/input"><InputView /></Route>
          <Route exact path="/output"><OutputView /></Route>
        </Switch>
      </Container>
    </Router>
  ); 
};