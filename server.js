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

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get'});
}

function loadDashboard(request, response) {
  let {username, password} = request.body;
  let SQL = `INSERT INTO users(username, password) VALUES ($1, $2);`;
  let values = [username, password];
  return client.query(SQL, values)
  .then(response.render('./pages/dashboard'))
}

function getLocation (request, response) {
  response.render('./pages/dashboard');
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