# Project Tasks

## frontend
1. fix top bar spacing (all to the right? middle?)
2. add profile sidebar
3. add login / register
  a. link these pages to backend
  b. implement proper auth
4. add map
  a. get a global map view that you can scroll / zoom 
  b. add spot markers w/popups displaying current size / quality
  c. clicking spots takes a user to spot forecast page
5. add spot management pages
  a. add spot page
  b. iterate on spot page structure, adding dummy graphs + info (d3js visuals)
  b. add spot create (potentially add your own spots, do later)
6. add spot review page
  a. add spot review create
  b. add spot review update
  c. add spot review delete
7. add wave outline to top bar
8. add rotating surf pictures faded into main page background

## backend
1. plan out some bare initial table schemas, put in one table
2. test query for 1 table to confirm working connection
3. figure out auth for login / password pages

## general
1. redo npm / webpack for updated packages and increased performance (includes deleting package-lock.json, node modules, and reinstalling properly)
2. figure out a new name, actually original
3. figure out how spot unlock mechanism (geotags and such)
4. figure out hosting
5. figure out how to grab forecast data necessary to make decently accurate forecasts
6. figure out testing throughout