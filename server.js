'use strict';

// Loads Environment Variables from .env
require('dotenv').config();

// NPM Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Dependency usage
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());



// API route methods
app.get('/', handleHomePage);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', hikingHandler);

// Initializes environment
app.listen(PORT, () => console.log('Server is running on port', PORT));

// check to see if client is connected
client.connect()
  .then(() => console.log('Client is connected'))
  .catch(error => console.error('Client is NOT connected', error));


// Memory Cache
// let locations = {};

// Home page
function handleHomePage(request, response) {
  response.send('Hello World times two. Initial Route');
}

// Refactored handler from lab 7 to 8 get link server to db
function locationHandler(request, response) {
  const SQL = 'SELECT * FROM locationdb WHERE search_query = $1';
  const safeQuery = [request.query.city];

  client.query(SQL, safeQuery)
    .then(results => {
      if (results.rowCount) {
        console.log('City is present in database');
        response.status(200).send(results.rows[0]);
      } else {
        console.log('City is NOT present')
        locationAPIHandler(request.query.city, response);
      }

    })
}
/////////////////////////////////Location/////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// location API environment
function locationAPIHandler(city, response) {
  // const city = request.query.city;
  const API = 'https://us1.locationiq.com/v1/search.php';

  let queryObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  };

  superagent
    .get(API)
    .query(queryObject)
    .then(data => {
      let locationData = new Location(data.body[0], city);
      // locations[city] = locationData;
      cacheLocation(locationData)
        .then(potato => {
          response.status(200).send(potato);
        })
    })
    .catch(function (error) {
      console.log(error);
      response.status(500).send('Something went wrong with Location Data')
    })
}

function cacheLocation(city, data) {
  // It's going to write to the database
  const location = new Location(data[0]);
  const values = [city, location.formatted_query, location.latitude, location.longitude];
  const SQL = `
    INSERT INTO locationdb (search_query, formatted_query, latitude, longitude)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  return client.query(SQL, values)
    .then(results => {
      console.log(results);
      return results.rows[0]
    })
}

function Location(obj, city) {
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

///////////////////////WEATHER/////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////


// weather API environment
function weatherHandler(request, response) {
  const API = 'https://api.weatherbit.io/v2.0/forecast/daily';

  let queryObject = {
    key: process.env.WEATHER_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    // format: 'json'
  };

  superagent.get(API)
    .query(queryObject)
    .then(apiData => {
      let dailyWeather = apiData.body.data.map(obj => {
        return new Weather(obj);
      });

      response.status(200).send(dailyWeather);
    })
    .catch(function () {
      response.status(500).send('Something went wrong with Weather Data');
    });
}

function Weather(forecast) {
  this.forecast = forecast.weather.description;
  this.time = new Date(forecast.datetime).toDateString();
}

function hikingHandler(request, response) {
  const API = 'https://www.hikingproject.com/data/get-trails';

  let queryObject = {
    lat: request.query.latitude,
    lon: request.query.longitude,
    key: process.env.TRAIL_API_KEY
  };

  superagent
    .get(API)
    .query(queryObject)
    .then(data => {
      let hikingData = data.body.trails;
      let trailData = hikingData.map((hike) => new Hiking(hike));
      response.status(200).send(trailData);
    })
    .catch(function () {
      response.status(500).send('Something went wrong with Hiking Data');
    })
}

///////////////////////TRAILS//////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////


// Trails API environment
function Hiking(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = new Date(obj.conditionDate.slice(0, 10)).toDateString();
  this.condition_time = obj.conditionDate.slice(11, 19);
}


// checks to see if all elements are working correctly
app.use('*', (request, response) => {
  response.status(404).send('You broke something.. Good job.');
});
