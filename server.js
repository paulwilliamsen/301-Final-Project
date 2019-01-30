'use strict';

const express = require('express');
const superagent = require('superagent');
const pg =require('pg');
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err=>console.log(err));

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`));

app.use(
  methodOverride(request => {
    if(request.body && typeof request.body === 'object' && '_method' in request.body) {
      let method = request.body._method;
      delete request.body._method;
      return method;
    }
  })
);
app.get('/', loadLogin);
app.post('/check-password', checkPassword);
app.post('/create-login', addAccount);
app.post('/location', requestLocation);
app.get('/location', requestLocation);
app.post('/events', createEvent);
app.get('/dashboard', requestNews);

app.get('/eventData', getEvents);
app.get('/dashboard', getAllInfo);


let uID = 0;
//error handler
function errorHandler(err, response){
  console.error(err);
  if(response) response.status(500).send('Something Broke!!!')
}

function getAllInfo(request, response) {
  console.log('line 49 getallinfo req', request);
  getWeather(request)
    .then(result => {
      console.log('line 52 result', result);
      //let weather = result.map(day => )
      response.render('pages/dashboard', {location : request, weather: result});
    })
    .catch(error => errorHandler(error));
}


//------------------ Login Functions --------------------------------//

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get', message: ''});
}


//Once the user attempts to login, go here.
function checkPassword (request, response){
  let SQL = `SELECT * FROM users WHERE username=$1 AND password=$2;`;
  let values = [request.body.username, request.body.password];

  client.query(SQL, values)
    .then(result => {
      //check the database for the username password combo.
      if(result.rows.length > 0){
        uID = result.rows[0].id;
        //If the user exists, go to lookupLocation then check for a location in the database
        Location.lookupLocation(result.rows[0].id, response);
      }
      else{
        response.render('./index', {message: 'This username/password does not exist. Please create an account.'})
      }
    })
    .catch( () => {
      response.render('./index')
    });
}


function addAccount(request, response) {
  let SQL = `SELECT * FROM users WHERE username=$1;`;
  let values = [request.body.username];

  client.query(SQL, values)
    .then(result => {
      if(result.rows.length > 0){
        response.redirect('/');
      } else{
        let {username, password} = request.body;
        let SQL = `INSERT INTO users(username, password) VALUES ($1, $2);`;
        let values = [username, password];
        return client.query(SQL, values)
          .then(response.redirect('/'))
      }
    })
}

//------------------ Location Functions --------------------------------//

Location.lookupLocation = (id, response)=>{
  const SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  const values = [id];
  client.query(SQL, values)
    .then(results=>{
      //check the database for any data for that specific user.
      if(results.rows.length > 0){
        //if there is a value in the database at that user_id, get the location.
        getLocation(results.rows[0].user_id, response);
      }
      else{
        //if there is no location data, then render the page for the user to enter a location.
        response.render('pages/location_page');
      }
    })
    .catch(error => errorHandler(error));
};

function requestLocation(request, response){
  Location.fetchLocation(request.body.search)
    .then(data=>{
      getAllInfo(data, response);
      //response.render('pages/dashboard', {location: data});
    })
    .catch(error => errorHandler(error));
}

function getLocation(id, response){

  //search the database and return a value for that user_id.
  let SQL =`SELECT * FROM locations WHERE user_id=$1;`;
  let values = [id];
  client.query(SQL, values)
    .then(result => {
      getAllInfo(result.rows[0], response);
    })
    .catch(error => errorHandler(error));
}

//When the button on the location page is submitted, go here. Ping the api.
Location.fetchLocation = (query)=>{
  const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(geoData)
    .then(response=>{
      if(!response.body.results.length){
        throw 'no data';
      }
      else{
        let location = new Location(query, response.body.results[0])
        //once it get the data from the api, go to the save function. That is where it checks for existing data, then replaces it if need be.
        return location.save()
          .then(() =>{
            return location;
          })
      }
    })
    .catch(error => errorHandler(error));
}

function Location(query, response){
  this.formatted_query = response.formatted_address;
  this.latitude = response.geometry.location.lat;
  this.longitude = response.geometry.location.lng;
  this.search_query = query;
  this.user_id = uID;
}

Location.prototype.save = function(){

  let SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  let values = [uID];
  return client.query(SQL, values)
    .then(results => {
      if(results.rows.length > 0){
        let SQL = `DELETE FROM locations WHERE user_id=$1;`;
        let values =[uID];
        return client.query(SQL, values);
      }})
    .then(()=>{
      let SQL = `INSERT INTO locations (formatted_query, latitude, longitude, search_query, user_id) VALUES ($1, $2, $3, $4, $5);`;
      let values =[this.formatted_query, this.latitude, this.longitude, this.search_query, this.user_id];
      return client.query(SQL, values);
    })
}

function createEvent(request, response) {
  let {date, start_time, title, description} = request.body;
  let SQL = `INSERT INTO events (date, start_time, title, description, user_id) VALUES ($1, $2, $3, $4, $5);`;
  let values = [date, start_time, title, description, 1];

  return client.query(SQL, values)
    .then( data =>{
      getEvents(data, response);
    })
    .catch(error => errorHandler(error));
}

function getEvents(request, response) {
  let SQL = `SELECT * FROM events WHERE user_id=$1;`;
  let values = [1];

  return client.query(SQL, values)
    .then(result=> {
      if(result.rows.length > 0) {
        response.render('pages/events_page', {events: result.rows});
      } else {
        response.render('pages/events_page', {events: ''});
      }
    })
    .catch(error => errorHandler(error));
}

/*-----------news-----------------*/
News.fetchNews = (query)=>{
  const allNewsData = `https://newsapi.org/v2/everything?q=${query.search_query}&from=2018-12-30&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
  return superagent.get(allNewsData)
    .then(results => {
      let newsDataArray =[];
      for(let i = 0; i<8; i++){
        let newsData = new News(results.body.articles[i]);
        newsDataArray.push(newsData);
      }
      return newsDataArray;
    })
}

function News(data){
  this.name = data.source.name;
  this.author = data.author;
  this.title = data.title;
  this.description = data.description;
  this.url = data.url;
  this.publishedAt = data.publishedAt;
};

function requestNews(request, response){
  News.fetchNews(request.body.search)
    .then(data=>{
      response.render('pages/dashboard', {news: data});
    });
}

/*-----------Weather----------------*/
function getWeather(request) {
  console.log('getWeather request', request);
  const weatherData = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.latitude},${request.longitude}`;

  return superagent.get(weatherData)
    .then(results => {
      const dailyWeather = results.body.daily.data.map(day => {
        return new Weather(day);
      });
      console.log('dailyWeather', dailyWeather);
      return (dailyWeather);
    })
    .catch(error => errorHandler(error));
}
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}
