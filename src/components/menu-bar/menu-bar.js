import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import { ConfigContext } from "contexts";
import { TaskStatus } from "components/task-status";
import { InfoNav } from "components/menu-bar/info-nav";

const toolName = tool => tool.replace("fuse-tool-", "");

export const MenuBar = () => {
  const [{ tools }] = useContext(ConfigContext);
  const location = useLocation();

  // XXX: Add cellfie for testing
  const testTools = ["cellfie", ...tools];

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
            { testTools.map((tool, i) => {
              const name = toolName(tool);
              return (
                <NavDropdown.Item key={ i } as="div">
                  <Nav.Link 
                    as={ NavLink } 
                    to={{ 
                      pathname: "/analyze", 
                      hash: `#${ name }` 
                    }}
                  >
                    { name }
                  </Nav.Link>
                </NavDropdown.Item>
              );
            })}
          </NavDropdown>
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
  );
};           