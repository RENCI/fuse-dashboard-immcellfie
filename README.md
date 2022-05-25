# fuse-dashboard-immcellfie
Dashboard for FUSE ImmCellFIE project.

Visit the main repo for FUSE ImmCellFIE [here](https://github.com/RENCI/fuse-immcellfie).

Look at .env.sample for an example of how to set the environmental variables.

Documentation on using the dashboard can be found in the [wiki](https://github.com/RENCI/fuse-dashboard-immcellfie/wiki).

This dashboard is dependent on RESTful services provided by [fuse-analysis](https://github.com/RENCI/fuse-analysis)

Point REACT_APP_FUSE_AGENT_API variable in .env to the RESTful services (e.g., fuse-analysis) instance to use.

Example:
```
REACT_APP_FUSE_AGENT_API=http://immcellfie.renci.org:8000
```
