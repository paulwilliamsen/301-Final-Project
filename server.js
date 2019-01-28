'use strict';

const express = require('express');
const superagent = require('superagent');
const pg =require('pg');
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT;
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

function loadLogin (request, response) {
  response.render('./index', {formaction: 'get'});
}

function getLocation(request, response) {
  response.render('./pages/dashboard');
}

