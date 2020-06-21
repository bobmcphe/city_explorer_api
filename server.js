'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require("superagent");

const PORT = process.env.PORT;

const app = express();

app.use( cors() );


app.get("/location", (request, response) => {
  const API1 = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${request.query.city}&format=json`;


superagent
  .get(API1)
  .then((data) => {
    let locationObj = new Location(data.body[0], request.query.city);
    response.status(200).send(locationObj);
  })
  .catch(() => {
    response.status(500).send(console.log("You broke me, now fix it."));
  });

  function Location(obj, city) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.formatted_query = obj.display_name;
}
});

//$('button').on('click', () => {})
// app.get('/restaurants', (request, response) => 
// { let data = require('./data/restaurants.json');

//   let allRestaurants = [];
//   data.nearby_restaurants.forEach( object => {
//     let restaurant = new Restaurant(object);
//     allRestaurants.push(restaurant);
//   });

//   response.status(200).json(allRestaurants);
// });

// function Restaurant(obj) {
//   this.restaurant = obj.restaurant.name;
//   this.locality = obj.restaurant.location.locality;
//   this.cuisines = obj.restaurant.cuisines;
// }

//////////////////////////WEATHER////////////////
const API2 = `https://api.weatherbit.io/v2.0/forecast/daily?city=Seattle,WA&key=${process.env.WEATHER_API_KEY}`;
console.log('weatherInfo: ', weatherInfo);

superagent
.get(API2)
.then((results) => { 

let weatherData = require('./data/weather.json');
  console.log('this is my weather data =============', weatherData);
    let weatherInfo = weatherData.data.map(stuff => {
   
   return new Forecast(stuff);
  });
  response.status(200).json(weatherInfo);

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;

};
});
////////////////////////////////////////////////
////////////////////version two/////////////////
///////////////////////////////////////////////
// app.get('/weather', (request, response) => {
//   let weatherData = require('./data/weather.json');
//   console.log('this is my weather data =============', weatherData);
//     const results = weatherData.data.map(stuff => {
   
//    return new Forecast(stuff);
//   });
//   response.status(200).json(results);
// });
// // TODO SOEMTHIGN

// function Forecast(obj) {
//   this.forecast = obj.weather.description;
//   this.time = obj.datetime;

// };




////////////////////////////////////////////////
//////////////////version one///////////////////////
//////////////////////////////////////////////////
// app.get('/weather', (request, response) => {
//   let weatherData = require('./data/weather.json');
//   let weeklyForecast = [];
//   weatherData.data.forEach(day => {
//     let forecast = new Forecast(day);
//     weeklyForecast.push(forecast);
//   });
//   response.status(200).json(weeklyForecast); //what exactly is this doing?
// });

// function Forecast(obj) {
//   this.forecast = obj.weather.description;
//   this.time = obj.datetime;
// }


app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server runninggggg on port', PORT));

//below is outline and pseudo-code of what I am trying to do, written by John

// Handle a request for location data
// Get a city from the client
// Fetch data from an API
// Adapt the data, using a Constructor Function
// Send the adapted data to the client


// Locaton Constructor Function
// Take in some big object, turn it into something that matches the contract


// Handle a request for restaurant data
// Get location information from the client (lat,long,city-name)
// Fetch data from an API
// Adapt the data, using a Constructor Function
// Send the adapted data to the client

// Restaurant Constructor Function
// Take in some big object, turn it into something that matches the contract