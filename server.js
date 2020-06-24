'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require("superagent");
const PORT = process.env.PORT;
const app = express();

app.use( cors() );


//declare routes
app.get('/', handleHomepage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);

app.get('/trail', handleTrail);

function handleLocation(request, response) {
  const API1 =  `HTTPS://US1.LOCATIONIQ.COM/V1/SEARCH.php?key=${process.env.GEOCODE_API_KEY}&Q=${REQUEST.QUERY.CITY}$FORMAT=JSON`;

  superagent
  .get(API1)
  .then((data) => {
    let locationObj = new Location(data.body[0], request.query.city);
    response.status(200).send(locationObj);
  })
  .catch(() => {
    response.status(500).send(console.log("You broke me, now fix it."));
  });
}

function Location(obj, city) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.formatted_query = obj.display_name;
  this.search_query = city;
}

// function handleWeather(request, response) {
  
// }


app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server runninggggg on port', PORT));