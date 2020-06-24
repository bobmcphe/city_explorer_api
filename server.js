'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require("superagent");

const PORT = process.env.PORT;

const app = express();

app.use( cors() );


//declare routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);

// app.get('/trail', handleTrail);

function handleHomePage(request, response) {
  response.send(`PORT ${PORT} is running`);
}

// In Memory Cache
let weathersC = {};


function handleLocation(request, response) {

  if (weathersC
    [request.query.city]) {
    console.log('we have it already...')
    response.status(200).send(weathersC
      [request.query.city]);
  }
  else {
    console.log('going to get it');
    fetchLocationDataFromAPI(request.query.city, response);
  }

}

function fetchLocationDataFromAPI(city, response) {

  const API1 = 'https://us1.locationiq.com/v1/search.php';

  let queryObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  }

  superagent
  .get(API1)
  .then((data) => {
    let locationObj = new Location(data.body[0], request.query.city);
    response.status(200).send(locationObj);
  })
  .catch(() => {
    response.status(500).send(console.log("You broke me -location- now fix it."));
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


///////////////////weather/////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

let weatherCache = {}; //why an empty object instead of an empty array? Is this only b/c the format in JSON file?


function handleWeather(request, response) {
  const coordinates = {
    lat: request.query.latitude,
    lon: request.query.longitude,
  };

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




























app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server running on port', PORT));