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
app.post('/dashboard', checkPassword);
app.post('/create-account', loadDashboard);
app.post('/location', findLocation);
app.post('/events', createEvent);
app.get('/dashboard', getAllInfo);


//error handler
function errorHandler(err, response){
  console.error(err);
  if(response) response.status(500).send('Something Broke!!!')
}


//------------------ Login Functions --------------------------------//

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get'});
}

function checkPassword (request, response){
  let SQL = `SELECT * FROM users WHERE username=$1 AND password=$2;`;
  let values = [request.body.username, request.body.password];

  client.query(SQL, values)
    .then(result => {
      if(result.rows.length > 0){
        findLocation(result.rows[0].id, response);
      }
      else{
        console.log('here in else')
        response.redirect('/')
      }
    })
    .catch( () => {
      console.log('here in catch')
      response.render('./index')
    });
}

function loadDashboard(request, response) {
  let SQL = `SELECT * FROM users WHERE username=$1;`;
  let values = [request.body.username];

  client.query(SQL, values)
    .then(result => {
      console.log(result.rows)
      if(result.rows.length > 0){
        console.log('username exists')
        response.redirect('/');
      } else{
        let {username, password} = request.body;
        let SQL = `INSERT INTO users(username, password) VALUES ($1, $2);`;
        let values = [username, password];
        return client.query(SQL, values)
          .then(response.render('./pages/dashboard', {data: 'No Data'}))
      }
    })
}


// function getLocation(request, response){
//   let SQL =`SELECT locations.formatted_query, locations.latitude, locations.longitude FROM locations WHERE location_id=$1 `
//   let values = [locationHandler.query.id];
//   return client.query(SQL, values);
// }


function findLocation(request, response){
  const locationHandler = {

    query: request,

    cacheHit: (results)=>{
      getAllInfo(results.rows[0]);
    },

    cacheMiss: ()=>{
      response.render('pages/location_page');
      // Location.fetchLocation(locationHandler.query)
      //   .then(data=>getAllInfo(data));
    }
  };
  Location.lookupLocation(locationHandler);
}

Location.lookupLocation = (handler)=>{

  const SQL = `SELECT * FROM locations WHERE user_id=$1;`;
  const values = [handler.query];

  client.query(SQL, values)
    .then(results=>{
      console.log('rowCount', results.rowCount);
      if(results.rowCount > 0){
        handler.cacheHit(results);
      }
      else{
        handler.cacheMiss();
      }
    })
    .catch(error => errorHandler(error));
};

Location.fetchLocation = (query)=>{
  const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(geoData)
    .then(response=>{
      if(!response.body.results.length){
        throw 'no data';
      }
      else{
        let location = new Location(query, response.body.results[0])
        console.log(location);
        return location.save()
          .then(result =>{
            location.id = result.rows[0].id;
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
}

Location.prototype.save = function(){
  let SQL = `INSERT INTO locations (formatted_query, latitude, longitude, search_query) VALUES ($1, $2, $3, $4) RETURNING id;`;
  let values =[this.formatted_query, this.latitude, this.longitude, this.search_query];
  return client.query(SQL, values);
}

function getAllInfo(request, response) {
  getEvents(user_id);

}

function createEvent(request, response) {
  let {date, start_time, title, description, user_id} = request.body;
  let SQL = `INSERT INTO events (date, start_time, title, description, user_id) VALUES ($1, $2, $3, $4, $5);`;
  let values = [date, start_time, title, description, user_id];

  return client.query(SQL, values)
    .then(response.render('pages/dashboard'))
    .catch(error => errorHandler(error));
}

function getEvents(request, response) {
  let SQL = `SELECT * FROM events WHERE user_id=$1;`;
  let values = [1];

  return client.query(SQL, values)
    .then(result=> {
      console.log(result);
      if(result.rows.length > 0) {
        console.log(result.rows.length);
        response.render('pages/dashboard', {data, events: result.rows});
      } else {
        response.render('pages/dashboard', 'No events saved.')
      }
    })
    .catch(error => errorHandler(error));
}

