'use strict';

const express = require('express');
const superagent = require('superagent');
const pg =require('pg');
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.envDATABASE_URL);
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
app.get('/dashboard', getLocation);


//error handler
function errorHandler(err, response){
	console.error(err);
	if(response) response.status(500).send('Something Broke!!!')
}

function getLocation(request, response){
  const locationHandler = {

    query: request.query.data,

    // cacheHit:

    cacheMiss: ()=>{
      Location.fetchLocation(request.query.data)
        .then(data=>response.send(data))
    }
  }
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

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get'});

// function getLocation(request, response) {
//   response.render('./pages/dashboard');
// }

