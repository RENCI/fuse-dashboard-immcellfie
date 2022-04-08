import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { ConfigContext } from "contexts";
import { InfoNav } from "./info-nav";
import { getServiceName, getServiceDisplay } from "utils/config-utils";

export const MenuBar = () => {
  const [{ tools }] = useContext(ConfigContext);
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="md" className="mb-3">
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
          <Nav.Link as={ NavLink } to="/subgroups">Subgroups</Nav.Link>
          <NavDropdown 
            menuVariant="dark" 
            title="Analyze"
            active={ location.pathname === "/analyze" }
          >
            { tools.map((tool, i) => (
              <NavDropdown.Item key={ i } as="div">
                <Nav.Link 
                  as={ NavLink } 
                  to={{ 
                    pathname: "/analyze", 
                    hash: `#${ getServiceName(tool) }` 
                  }}
                >
                  { getServiceDisplay(tool) }
                </Nav.Link>
              </NavDropdown.Item>              
            ))}
          </NavDropdown>
        </Nav>
        <InfoNav />
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
  );
};           