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
// app.get('/dashboard', getLocation);
app.get('/dashboard', checkPassword);
app.post('/dashboard', loadDashboard);


//error handler
function errorHandler(err, response){
	console.error(err);
	if(response) response.status(500).send('Something Broke!!!')
}

function loadDashboard(request, response) {
  let {username, password} = request.body;
  let SQL = `INSERT INTO users(username, password) VALUES ($1, $2);`;
  let values = [username, password];
  return client.query(SQL, values)
  .then(response.render('./pages/dashboard'))
}

function getLocation(request, response){
	let SQL =`SELECT locations.formatted_query, locations.latitude, locations.longitude FROM locations WHERE location_id=$1 `
	let values = [locationHandler.query.id];
	return client.query(SQL, values);
}

function findLocation(request, response){
  const locationHandler = {

    query: request.query.data,

    // cacheHit:

    cacheMiss: ()=>{
      Location.fetchLocation(request.query.data)
        .then(data=>response.send(data))
    }
	}
	Location.lookupLocation(locationHandler);
}

function checkPassword (request, response){
  let SQL = `SELECT * FROM users WHERE username=$1 AND password=$2;`;
  let values = [request.query.username, request.query.password];

  client.query(SQL, values)
  .then(result => {
    if(result.rows.length > 0){
      response.render('./pages/dashboard');
    }
    else{
      response.render('./index')
    }
  })
  .catch( () => {
    response.render('./index')
  });
}

Location.fetchLocation(query){
	const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
	return superagent.get(geoData)
		.then(response=>{
			if(!response.body(data)){
				throw 'no data';
			}
			else{
				let location = new Location(query, response.body.results[0])
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

Location.prototype.save(){
	let SQL = `INSERT INTO locations (formatted_query, latitude. longitude, search_query) VALUES ($1, $2, $3, $4) RETURNING id;`;
	let values =[this.formatted_query, this.latitude, this.longitude, this.search_query];
	return client.query(SQL, values);
}

Location.lookupLocation = (handler){
	const SQL = `SELECT * FROM locations WHERE search_query=$1`
	const values = [handler.query];

	return client.query(SQL, values)
		.then(results=>{
			if(results.rowCount > 0){
				handler.cacheHit(results);
			}
			else{
				handler.cacheMiss();
			}
		})
		.catch(console.error);
};

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get'});
}
// function getLocation(request, response) {
//   response.render('./pages/dashboard');
// }

