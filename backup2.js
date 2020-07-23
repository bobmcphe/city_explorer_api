'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


const PORT = process.env.PORT || 8080;

const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

app.use( cors() );


//declare routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
// app.get('/trails', handleTrail);
// app.get('/movies', handleMovie);
// app.use("*", notFoundHandler);


function handleHomePage(request, response) {
  response.send(`PORT ${PORT} is running`);
}

// check to see if client is connected
client.connect()
  .then(() => console.log('Client is connected'))
  .catch(error => console.error('Client is NOT connected', error));

/////////////////LOCATION/////////////////////
//////////////////////////////////////////////
/////////////////////////////////////////////

// In Memory Cache
function handleLocation(request, response) {
  const SQL = 'SELECT * FROM locationdb WHERE search_query = $1;';
  const safeQuery = [request.query.city];
  client.query(SQL, safeQuery)
    .then(results => {
      if (results.rowCount) {
        response.status(200).send(results.rows[0]);
      } else {
        fetchLocationDataFromAPI(request.query.city, response);
      }
    })
    .catch(error => response.status(500).send(error));
}

function fetchLocationDataFromAPI(city, response) {
  const API = `https://us1.locationiq.com/v1/search.php`;
  let queryObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  };

  superagent
    .get(API)
    .query(queryObject)
    .then(apiData => {
      let location = new Location(apiData.body[0], city);
      console.log('1111111111111111');
      console.log(API);
      cacheLocationToDataBase(location);
      response.status(200).send(location);
    })
    .catch(() => {
      response.status(500).send('error with LOCATION');
    });
}

function cacheLocationToDataBase(city, data) {
  const location = new Location(data[0]);
  const safeQuery1 = [city, location.formatted_query, location.latitude, location.longitude];
  const SQL1 = `
      INSERT INTO locationdb (search_query, formatted_query, latitude, longitude) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `;
  client.query(SQL1, safeQuery1)
    .then(results => console.log('New City added to DB: ', results.rows[0]));
}

function Location(obj, city) {
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

///////////////////weather/////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function handleWeather(request, response) {
  console.log(request.query);
  const coordinates = {
     lat: request.query.latitude,
     lon: request.query.longitude,
 
  };
  console.log('made it into weather handler');
  const API = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${coordinates.lat}&lon=${coordinates.lon}&days=8`;

  superagent 
    .get(API)
    .then((dataResults) => {
      let results = dataResults.body.data.map((result) => {
        return new Weather(result);
      });
      response.status(200).json(results);
    })
    .catch((err) => {
      console.error("Your weather api is broke", err);
    });
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}


///////////////Trails///////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

function handleTrail(request, response) {
  const API = `https://www.hikingproject.com/data/get-trails`; 

  const trailObject = {
    key: process.env.TRAIL_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude
  };

  superagent
    .get(API)
    .query(trailObject)
    .then((dataResults) => {
      let results = dataResults.body.trails.map((result) => {
        return new Trail(result);
      });
      console.log(results);
      response.status(200).json(results);
    })
    .catch((err) => {
      console.error(" Your trail api is not working - fix it", err);
    });
}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  let splitDateTime = obj.conditionDate.split(' ')
  this.condition_date = splitDateTime[0];
  this.condition_time = splitDateTime[1];
}



app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server running on port', PORT));