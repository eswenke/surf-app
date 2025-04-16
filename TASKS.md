# Project Tasks

## frontend
- add profile sidebar navlinks
- add login / register
  - link these pages to backend
  - implement proper auth
- add map (mapbox, maplibre, openmaptiles for free map tiles)
  - get a global map view that you can scroll / zoom 
  - add spot markers w/popups displaying current size / quality
  - clicking spots takes a user to spot forecast page
- add spot management pages
  - add spot page
  - iterate on spot page structure, adding dummy graphs + info (d3js visuals)
  - add spot create (potentially add your own spots, do later)
- add spot review page
  - add spot review create
  - add spot review update
  - add spot review delete
- add wave outline to top bar
- add rotating surf pictures faded into main page background

## backend
- plan out some bare initial table schemas, put in one table
- test query for 1 table to confirm working connection
- figure out auth for login / password pages
  - check out Auth0? ask Lucas

## general
- redo npm / webpack for updated packages and increased performance (includes deleting package-lock.json, node modules, and reinstalling properly)
- figure out a new name, actually original
- figure out how spot unlock mechanism (geotags and such)
- figure out hosting
- figure out how to grab forecast data necessary to make decently accurate forecasts
- figure out testing throughout
- github vulnerabilities?