'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response, request} = require('express');

const PORT = process.env.PORT;

const app = express();

app.use( cors() );


//declare routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.use("*", notFoundHandler);
// app.get('/trail', handleTrail);

function handleHomePage(request, response) {
  response.send(`PORT ${PORT} is r;alskdjflaksdjf;lkaunning`);
}

// In Memory Cache
let weathersCache = {};


function handleLocation(request, response) {
console.log('I entered this function');
  if (weathersCache
    [request.query.city]) {
    console.log('we have it already...')
    response.status(200).send(weathersCache
      [request.query.city]);
  }
  else {
    console.log('going to get it');
    console.log(request.query);
    fetchLocationDataFromAPI(request.query.city, response);
  }

}

function fetchLocationDataFromAPI(city, response) {
console.log(city);
  const API1 = 'https://us1.locationiq.com/v1/search.php';

  let queryObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  }

  superagent
  .get(API1)
  .query(queryObject)
  .then((data) => {
    // console.log(data.body);
    let locationObj = new Location(data.body[0], city);
    // console.log(locationObj);
    response.status(200).send(locationObj);
  })
  .catch((e) => {
    console.log(e);
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
  console.log(request.query);
  const coordinates = {
    lat: request.query.latitude,
    lon: request.query.longitude,
    // lat: 47.6038321,
    // lon: -122.3300624
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


function notFoundHandler(request, response){
  response.status(404).send('route not found');
}

























app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server running on port', PORT));