import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { Container } from "react-bootstrap";
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
import { MenuBar } from "components/menu-bar";
import { DatasetMonitor } from "components/dataset-monitor";
import { ErrorMessage } from "components/error-message";

export const App = () => { 
  return (
    <ErrorProvider>
    <ConfigProvider>
    <UserProvider>
    <DataProvider>
    <ModelProvider>
    <ColorProvider>
      <Router>
        <MenuBar />
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