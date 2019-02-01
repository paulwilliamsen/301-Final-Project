'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use(
  methodOverride(request => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
      let method = request.body._method;
      delete request.body._method;
      return method;
    }
  })
);
app.get('/', loadLogin);
app.get('/about', (request, response) => {
  response.render('pages/about', {uID})
});
app.post('/check-password', checkPassword);
app.post('/create-login', addAccount);
app.post('/location', requestLocation);
app.post('/dashboard', loadDashboard);
app.post('/events', createEvent);
app.get('/pages/:event_id', getOneEvent);
app.put('/update/:id', updateEvent);
app.get('/eventData', getEvents);
app.delete('/delete/:event_id', deleteEvent);

app.get('*', errorHandler);


//let uID = 0;

//error handler
function errorHandler(response) {
  response.render('pages/error');
}

//get all info for dashboard
function getAllInfo(request, response, id) {

  getWeather(request)
    .then(result => {
      getTraffic(request)
        .then(incident =>{
          fetchNews()
            .then(story => {
              response.render('pages/dashboard', { location: request,traffic: incident, weather: result, news: story, uID: id });
            })
            .catch(error => errorHandler(error));
        })
        .catch(error => errorHandler(error));
    })
    .catch(error => errorHandler(error));
}


//------------------ Login Functions --------------------------------//

function loadLogin(request, response) {
  response.render('./index', { formaction: 'get', message: '' });
}


//Once the user attempts to login, go here.
function checkPassword(request, response) {
  let SQL = `SELECT * FROM users WHERE username=$1 AND password=$2;`;
  let values = [request.body.username, request.body.password];

  client.query(SQL, values)
    .then(result => {
      //check the database for the username password combo.
      if (result.rows.length > 0) {
        //If the user exists, go to lookupLocation then check for a location in the database
        Location.lookupLocation(result.rows[0].id, response);
      }
      else {
        response.render('./index', { message: 'This username/password does not exist. Please create an account.' })
      }
    })
    .catch(() => {
      response.render('./index')
    });
}


function addAccount(request, response) {
  let SQL = `SELECT * FROM users WHERE username=$1;`;
  let values = [request.body.username];

  client.query(SQL, values)
    .then(result => {
      if (result.rows.length > 0) {
        response.render('./index', { message: 'This username already exists. Please click Create Account and enter a different username.' })
      } else {
        let { username, password } = request.body;
        let SQL = `INSERT INTO users(username, password) VALUES ($1, $2);`;
        let values = [username, password];
        return client.query(SQL, values)
          .then(response.render('./index', {message: 'User Account created succesfully. Please log in now!'}))
      }
    })
}

//------------------ Location Functions --------------------------------//

Location.lookupLocation = (id, response) => {
  const SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  const values = [id];
  client.query(SQL, values)
    .then(results => {
      //check the database for any data for that specific user.
      if (results.rows.length > 0) {
        //if there is a value in the database at that user_id, get the location.
        getLocation(results.rows[0].user_id, response, id);
      }
      else {
        //if there is no location data, then render the page for the user to enter a location.
        response.render('pages/location_page', {uID: id});
      }
    })
    //.catch(err => errorHandler(err));
};

function requestLocation(request, response) {
  Location.fetchLocation(request.body.search, request.body.uID)
    .then(data => {
      getAllInfo(data, response, request.body.uID);
      //response.render('pages/dashboard', {location: data});
    })
    .catch(error => errorHandler(error));
}
function loadDashboard(request, response) {
  Location.lookupLocation(request.body.userId, response);
}

function getLocation(id, response) {
  //search the database and return a value for that user_id.
  let SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  let values = [id];
  client.query(SQL, values)
    .then(result => {
      getAllInfo(result.rows[0], response, id);
    })
    .catch(error => errorHandler(error));
}

//When the button on the location page is submitted, go here. Ping the api.
Location.fetchLocation = (query, uID) => {
  const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(geoData)
    .then(response => {
      if (!response.body.results.length) {
        throw 'no data';
      }
      else {
        let location = new Location(query, response.body.results[0], uID)
        //once it get the data from the api, go to the save function. That is where it checks for existing data, then replaces it if need be.
        return location.save(uID)
          .then(() => {
            return location;
          })
      }
    })
    .catch(error => errorHandler(error));
}

function Location(query, response, uID) {
  this.formatted_query = response.formatted_address;
  this.latitude = response.geometry.location.lat;
  this.longitude = response.geometry.location.lng;
  this.search_query = query;
  this.user_id = uID;
  this.lat = response.geometry.viewport.northeast.lat;
  this.lng = response.geometry.viewport.northeast.lng;
  this.latsw = response.geometry.viewport.southwest.lat;
  this.lngsw = response.geometry.viewport.southwest.lng;
}

Location.prototype.save = function (uID) {

  let SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  let values = [uID];
  return client.query(SQL, values)
    .then(results => {
      if (results.rows.length > 0) {
        let SQL = `DELETE FROM locations WHERE user_id=$1;`;
        let values = [uID];
        return client.query(SQL, values);
      }
    })
    .then(() => {
      let SQL = `INSERT INTO locations (formatted_query, latitude, longitude, search_query, user_id, lat, lng,latsw, lngsw) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9);`;
      let values = [this.formatted_query, this.latitude, this.longitude, this.search_query, this.user_id, this.lat, this.lng, this.latsw, this.lngsw];
      return client.query(SQL, values);
    })
}

function createEvent(request, response) {
  console.log('line 216', request.body);
  let { date, start_time, title, description, uID } = request.body;
  let SQL = `INSERT INTO events (date, start_time, title, description, uID) VALUES ($1, $2, $3, $4, $5) RETURNING uID;`;
  let values = [date, start_time, title, description, uID];

  return client.query(SQL, values)
    .then(data => {
      console.log('data line 223', data);
      getEventsBody(request, response);
    })
    .catch(err => errorHandler(err));
}

//Need to be a body
function getEventsBody(request, response) {
  let SQL = `SELECT * FROM events WHERE uID=$1 ORDER BY date ASC, start_time ASC;`;
  console.log('req.body at 232', request.body);
  let values = [request.body.uID];

  return client.query(SQL, values)
    .then(result => {
      if (result.rows.length > 0) {
        response.render('pages/events_page', { events: result.rows, uID: request.body.uID });
      } else {
        response.render('pages/events_page', { events: '', uID: request.body.uID });
      }
    })
    .catch(error => errorHandler(error));
}

//needs to be a query
function getEvents(request, response) {
  let SQL = `SELECT * FROM events WHERE uID=$1 ORDER BY date ASC, start_time ASC;`;
  console.log('req.body at 249', request.query);
  let values = [request.query.uID];

  return client.query(SQL, values)
    .then(result => {
      if (result.rows.length > 0) {
        response.render('pages/events_page', { events: result.rows, uID: request.query.uID });
      } else {
        response.render('pages/events_page', { events: '', uID: request.query.uID });
      }
    })
    .catch(error => errorHandler(error));
}

/*-----------news-----------------*/
function fetchNews() {
  const allNewsData = `https://newsapi.org/v2/everything?q=unitedstates&sortBy=publishedAt&keyword=national&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`;

  return superagent.get(allNewsData)
    .then(results => {
      let newsDataArray = [];
      for (let i = 0; i < 8; i++) {
        let newsData = new News(results.body.articles[i]);
        newsDataArray.push(newsData);
      }
      return newsDataArray;
    })
}

function News(data) {
  this.name = data.source.name;
  this.author = data.author;
  this.title = data.title;
  this.description = data.description;
  this.url = data.url;
  this.publishedAt = data.publishedAt;
  this.image_url = data.urlToImage;
}

/*-----------Weather----------------*/
function getWeather(request) {

  const weatherData = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.latitude},${request.longitude}`;

  return superagent.get(weatherData)
    .then(results => {
      const dailyWeather = results.body.daily.data.map(day => {
        return new Weather(day);
      });
      return (dailyWeather);
    })
    .catch(error => errorHandler(error));
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.high = day.temperatureHigh;
  this.low = day.temperatureLow;
  let iconList = {
    'clear-day': './icons/sunny.png',
    'clear-night':'./icons/clearnight.png',
    'rain':'./icons/rainy.png',
    'snow':'./icons/snowy.png',
    'sleet':'./icons/sleet.png',
    'wind':'./icons/windy.png',
    'fog':'./icons/dayfog.png',
    'cloudy':'./icons/nightfog.png',
    'partly-cloudy-day':'./icons/partlycloudyday.png',
    'partly-cloudy-night':'./icons/partlycloudyday.png'
  }
  this.icon = iconList[day.icon];
}
/*--------------------------Events----------------------------*/
function getOneEvent(request, response) {
  console.log('LN 326');
  let SQL = 'SELECT * FROM events WHERE id=$1;';
  let values = [request.params.event_id];

  client
    .query(SQL, values)
    .then(result => {
      return response.render('pages/singleEvent', { info: result.rows[0], uID: request.query.uID });
    })
    .catch(err => errorHandler(err, response));
}

function updateEvent(request, response) {
  console.log('line 337', request.body)
  let { date, start_time, title, description } = request.body;
  let SQL = `UPDATE events SET date=$1, start_time=$2, title=$3, description=$4 WHERE id=$5;`;
  let values = [date, start_time, title, description, request.params.id];

  client
    .query(SQL, values)
    .then(response.redirect('/eventData', {uID: request.body.uID}))
    .catch(err => errorHandler(err, response));
}

function deleteEvent(request, response){
  let SQL =`DELETE FROM events WHERE id=$1;`;
  let values = [request.params.event_id];

  client.query(SQL, values)
    .then(response.redirect('/eventData'))
    .catch(err => errorHandler(err, response));
}

/*----------Traffic---------------------*/
function getTraffic(request){
  const trafficData = `http://www.mapquestapi.com/traffic/v2/incidents?key=${process.env.TRAFFIC_API_KEY}&boundingBox=${request.lat},${request.lng},${request.latsw},${request.lngsw}&filters=incidents`;

  return superagent.get(trafficData)
    .then(results =>{
      let trafficArray=[];
      for(let i = 0; i<results.body.incidents.length; i++){
        let trafficData = new Traffic(results.body.incidents[i]);
        trafficArray.push(trafficData);
      }
      return trafficArray;
    })
}

function Traffic(incident){
  this.fullDesc = incident.fullDesc;
  this.iconURL = incident.iconURL;
}
