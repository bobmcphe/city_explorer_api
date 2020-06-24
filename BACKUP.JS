
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


// function Forecast(obj) {
//   this.forecast = obj.weather.description;
//   this.time = obj.datetime;

// };

