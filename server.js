'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { response, request} = require('express');
const pg = require('pg');


const PORT = process.env.PORT || 8080;

const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

app.use( cors() );


//declare routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
// app.get('/weather', handleWeather);
// app.get('/trails', handleTrail);
// app.get('/movies', handleMovie);
// app.use("*", notFoundHandler);


function handleHomePage(request, response) {
  response.send(`PORT ${PORT} is running`);
}

// In Memory Cache
let locationCache = {};


// function handleLocation(request, response) {
// console.log('I entered this function');
//   if (locationCache
//     [request.query.city]) {
//     console.log('we have it already...') //not working
//     response.status(200).json(locationCache
//       [request.query.city]);
//   }
//   else {
//     console.log('going to get it');
//    // console.log(request.query);
//     fetchLocationDataFromAPI(request.query.city, response);
//   }

// }

function handleLocation(request, response) {
  const SQL = 'SELECT * FROM locations WHERE search_query = $1';
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

function fetchLocationDataFromAPI(city, response) {
//console.log(city);
  const API1 = 'https://us1.locationiq.com/v1/search.php';

  let trailObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  }

  superagent
  .get(API1)
  .query(trailObject)
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

function saveToDB(obj){
  const lat = obj.latitude;
  const lon = obj.longitude;
  const formatted_query = obj.formatted_query;
  const search_query = obj.search_query;
  const safeQuery = [lat, lon, formatted_query, search_query];

  //create SQL search query
  const SQL = 'INSERT INTO locationdb (lat, lon, formatted_query, search_query) VALUES ($1, $2, $3, $4);'

  client.query(SQL, safeQuery)
      .then (results => {
          response.status(200).json(results);
      })
      .catch(error => {response.status(500).send(error)});
}


///////////////////weather/////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

let weatherCache = {}; //why an empty object instead of an empty array? Is this only b/c the format in JSON file?


function handleWeather(request, response) {
  console.log(request.query);
  const coordinates = {
     lat: request.query.latitude,
     lon: request.query.longitude,
    //lat: 47.6038321,
    //lon: -122.3300624
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


// function notFoundHandler(request, response){
//   response.status(404).send('route not found');
// }


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


///////////////Movies///////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// function handleMovie(request, response) {
//   const API = `https://api.themoviedb.org/`; 

//   const movieObject = {
//     key: process.env.MOVIE_API_KEY,
//   };

//   superagent
//     .get(API)
//     .query(movieObject)
//     .then((dataResults) => {
//       console.log(dataResults);
//       let results = dataResults.body.map((result) => {
//         return new Movie(result);
//       });
//       response.status(200).json(results);
//     })
//     .catch((err) => {
//       console.error(" Your movie api is not working - fix it", err);
//     });
// }

// function Movie(obj) {
//   this.title = obj.original_title;
//   this.overview = obj.overview;
//   this.average_votes = obj.vote_average;
//   this.total_votes = obj.vote_count;
//   this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
//   this.popular = obj.popularity;
//   this.released_on = obj.release_date;
// }












app.use('*', (request,response) => {
  response.status(404).send('Huhhhh?');
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('server is brokenmnn');
});

app.listen( PORT, () => console.log('Server running on port', PORT));