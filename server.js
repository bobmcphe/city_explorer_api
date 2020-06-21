'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');


const PORT = process.env.PORT;

const app = express();

app.use( cors() );


app.get('/location', (request, response) => {
  let data = require('./data/location.json');
  let actualData = new Location(data[0]);
  actualData.search_query = request.query.city;
  response.status(200).json(actualData);
});

function Location( obj ) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;

}

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

app.get('/weather', (request, response) => {
  let weatherData = require('./data/weather.json');
  console.log('this is my weather data =============', weatherData);
    const results = weatherData.data.map(stuff => {
   
   return new Forecast(stuff);
  });
  response.status(200).json(results);
});
// TODO SOEMTHIGN

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;

};


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