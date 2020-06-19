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
app.get('/restaurants', (request, response) => 
{ let data = require('./data/restaurants.json');

  let allRestaurants = [];
  data.nearby_restaurants.forEach( restObject => {
    let restaurant = new Restaurant(restObject);
    allRestaurants.push(restaurant);
  });

  response.status(200).json(allRestaurants);
});

function Restaurant(obj) {
  this.restaurant = obj.restaurant.name;
  this.locality = obj.restaurant.location.locality;
  this.cuisines = obj.restaurant.cuisines;
}

//////////////////////////WEATHER////////////////

app.get('/weather', (request, response) => {
  let weatherData = require('./data/weather.json');
  let weekPrediction = [];
  weatherData.data.forEach(day => {
    let forecast = new Forecast(day);
    weekPrediction.push(forecast);
  });
  response.status(200).json(weekPrediction);
});

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// $('thing').on('something', () => {})
// app.get('/weather', (request, response) => {
//     let data = require('./data/weather.json');
  
//     let weatherData = [];
//     data.forEach( restObject => {
//       let weather = new Weather(restObject);
//       weatherData.push(weather);
//     });
  
//     response.status(200).json(weatherData);
//   });
  
//   function Weather(obj) {
//     this.high_temp = obj.data.obj.high_temp;
//     this.wind_spd = obj.data.wind_spd;
//     this.description = obj.data.description;
//   }

// app.put(), app.delete(), app.post()

app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server runninggggg on port', PORT));

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