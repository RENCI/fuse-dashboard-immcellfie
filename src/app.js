import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { Container } from "react-bootstrap";
import { 
  Home, 
  UserView,
  DataView,
  SubgroupView,
  AnalyzeView
} from "views";
import {
  ErrorProvider,
  RunningProvider,
  ReadyProvider,
  ConfigProvider,
  UserProvider, 
  DataProvider, 
  ModelProvider,
  PCAProvider,
  ColorProvider
} from "contexts";
import { MenuBar } from "components/menu-bar";
import { DatasetMonitor } from "components/dataset-monitor";
import { RunningMessage } from "components/running-message";
import { ReadyMessage } from "components/ready-message";
import { ErrorMessage } from "components/error-message";

export const App = () => { 
  return (
    <ErrorProvider>
    <RunningProvider>
    <ReadyProvider>
    <ConfigProvider>
    <UserProvider>
    <DataProvider>
    <ModelProvider>
    <PCAProvider>
    <ColorProvider>
      <Router>
        <MenuBar />
        <Container fluid>          
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/user"><UserView /></Route>
            <Route exact path="/data"><DataView /></Route>
            <Route exact path="/subgroups"><SubgroupView /></Route>
            <Route exact path="/analyze"><AnalyzeView /></Route>
            <Redirect to="/" />
          </Switch>
          <RunningMessage />
          <ReadyMessage />
          <ErrorMessage />
        </Container>
      </Router>
      <DatasetMonitor />
    </ColorProvider>
    </PCAProvider>
    </ModelProvider>
    </DataProvider>    
    </UserProvider>
    </ConfigProvider>
    </ReadyProvider>
    </RunningProvider>
    </ErrorProvider>
  ); 
};