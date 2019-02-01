# The Daily Plan-it

![Planet](https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80)

## Team Members:
 
>**Chris Merritt**

>**Dan-Huy Le**

>**Jessica Roland**

>**Paul Williamsen**

<br/>

### Project Description:

How many applications do you browse each morning to prepare for your day? Do you check the weather? Do you look up the news? This application is designed as a central hub to kick-start your day. When you log into your account, your dashboard will display the last location you searched as well as the current weather and news for that location. You will also have the ability to create and manage the events and tasks in your life.

<br/>

### Libraries & Packages:  

Express
EJS
jQuery
Superagent
PostgreSQL
method-override
dotenv

<br/>

### User Stories:


As a user, I want to view my day-to-day planning resources in one place so I can save time gathering information.  

As a user, I want to view the weather forecast for a specified location.

As a user, I want to view the news for a specified location.

As a user, I want the ability to create, view and manage a list of events and tasks. 

<br/>

As a developer, I want to create an application that provides a user with the information they need to plan their day so they will not spend extra time searching for the information.

As a developer, I want my application to retrieve and display the weather forecast for a specified location.

As a developer, I want my application to retreive and display news articles for a specified location.

As a developer, I want my application store data for user events/tasks in a database table.

As a developer, I want my application to retrieve event/task data from the database and display it for the user.

<br>

###APIs Used

News API


example directly from their site:

https://newsapi.org/v2/everything?q=bitcoin&from=2019-01-01&sortBy=publishedAt&apiKey=API_KEY

{
"status": "ok",
"totalResults": 5083,
-"articles": [
-{
-"source": {
"id": null,
"name": "Coindesk.com"
},
"author": "Nikhilesh De",
"title": "Wall Street Crypto Products May Have to Wait as US Regulators Confront Backlog",
"description": "The SEC and CFTC have five weeks of work to catch up on, and crypto advocates have no illusions that bitcoin ETFs and the like are a priority.",
"url": "https://www.coindesk.com/wall-street-crypto-products-may-have-to-wait-as-us-regulators-confront-backlog",
"urlToImage": "https://static.coindesk.com/wp-content/uploads/2019/01/Capitol-Hill.jpg",
"publishedAt": "2019-02-01T15:30:32Z",
"content": "The U.S. government may be open again, but don’t hold your breath for regulatory approvals of crypto investment products.\r\nThe shutdown, which began on Dec. 22, 2018 and ended on Jan. 25, forced federal agencies, including the Securities and Exchange Commissi… [+5940 chars]"
},
<br>
Dark Sky API

example directly from their site:

https://api.darksky.net/forecast/[key]/[latitude],[longitude]

  "daily": {
              "summary": "Mixed precipitation throughout the week, with temperatures falling to 39°F on Saturday.",
              "icon": "rain",
              "data": [{
                  "time": 1509944400,
                  "summary": "Rain starting in the afternoon, continuing until evening.",
                  "icon": "rain",
                  "sunriseTime": 1509967519,
                  "sunsetTime": 1510003982,
                  "moonPhase": 0.59,
                  "precipIntensity": 0.0088,
                  "precipIntensityMax": 0.0725,
                  "precipIntensityMaxTime": 1510002000,
                  "precipProbability": 0.73,
                  "precipType": "rain",
                  "temperatureHigh": 66.35,
                  "temperatureHighTime": 1509994800,
                  "temperatureLow": 41.28,
                  "temperatureLowTime": 1510056000,
                  "apparentTemperatureHigh": 66.53,
                  "apparentTemperatureHighTime": 1509994800,
                  "apparentTemperatureLow": 35.74,
                  "apparentTemperatureLowTime": 1510056000,
                  "dewPoint": 57.66,
                  "humidity": 0.86,
                  "pressure": 1012.93,
                  "windSpeed": 3.22,
                  "windGust": 26.32,
                  "windGustTime": 1510023600,
                  "windBearing": 270,
                  "cloudCover": 0.8,
                  "uvIndex": 2,
                  "uvIndexTime": 1509987600,
                  "visibility": 10,
                  "ozone": 269.45,
                  "temperatureMin": 52.08,
                  "temperatureMinTime": 1510027200,
                  "temperatureMax": 66.35,
                  "temperatureMaxTime": 1509994800,
                  "apparentTemperatureMin": 52.08,
                  "apparentTemperatureMinTime": 1510027200,
                  "apparentTemperatureMax": 66.53,
                  "apparentTemperatureMaxTime": 1509994800
              },
            ...
            ]
          },
          "alerts": [
          {
            "title": "Flood Watch for Mason, WA",
            "time": 1509993360,
            "expires": 1510036680,
            "description": "...FLOOD WATCH REMAINS IN EFFECT THROUGH LATE MONDAY NIGHT...\nTHE FLOOD WATCH CONTINUES FOR\n* A PORTION OF NORTHWEST WASHINGTON...INCLUDING THE FOLLOWING\nCOUNTY...MASON.\n* THROUGH LATE FRIDAY NIGHT\n* A STRONG WARM FRONT WILL BRING HEAVY RAIN TO THE OLYMPICS\nTONIGHT THROUGH THURSDAY NIGHT. THE HEAVY RAIN WILL PUSH THE\nSKOKOMISH RIVER ABOVE FLOOD STAGE TODAY...AND MAJOR FLOODING IS\nPOSSIBLE.\n* A FLOOD WARNING IS IN EFFECT FOR THE SKOKOMISH RIVER. THE FLOOD\nWATCH REMAINS IN EFFECT FOR MASON COUNTY FOR THE POSSIBILITY OF\nAREAL FLOODING ASSOCIATED WITH A MAJOR FLOOD.\n",
            "uri": "http://alerts.weather.gov/cap/wwacapget.php?x=WA1255E4DB8494.FloodWatch.1255E4DCE35CWA.SEWFFASEW.38e78ec64613478bb70fc6ed9c87f6e6"
          },
<br>
MapQuest API

example from their site:

http://www.mapquestapi.com/traffic/v2/incidents?key=KEY&boundingBox=39.95,-105.25,39.52,-104.71&filters=construction,incidents

{
  "incidents": [
    {
      "fullDesc": "One lane closed due to maintenance work on California Street Eastbound between 18th Street and 19th Street.",
      "lng": -104.9886,
      "severity": 2,
      "shortDesc": "California Street E/B : Lane closed between 18th Street and 19th Street ",
      "endTime": "2013-08-02T01:59:00",
      "type": 1,
      "id": "330627538",
      "startTime": "2013-02-04T19:00:00",
      "impacting": true,
      "tmcs": [],
      "eventCode": 0,
      "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png",
      "lat": 39.7481
    }
<br>
Google Geocoding API

example from their site:

https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY

{
   "results" : [
      {
         "address_components" : [
            {
               "long_name" : "1600",
               "short_name" : "1600",
               "types" : [ "street_number" ]
            },
            {
               "long_name" : "Amphitheatre Pkwy",
               "short_name" : "Amphitheatre Pkwy",
               "types" : [ "route" ]
            },
            {
               "long_name" : "Mountain View",
               "short_name" : "Mountain View",
               "types" : [ "locality", "political" ]
            },
            {
               "long_name" : "Santa Clara County",
               "short_name" : "Santa Clara County",
               "types" : [ "administrative_area_level_2", "political" ]
            },
            {
               "long_name" : "California",
               "short_name" : "CA",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "United States",
               "short_name" : "US",
               "types" : [ "country", "political" ]
            },
            {
               "long_name" : "94043",
               "short_name" : "94043",
               "types" : [ "postal_code" ]
            }
         ],
         "formatted_address" : "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
         "geometry" : {
            "location" : {
               "lat" : 37.4224764,
               "lng" : -122.0842499
            },
            "location_type" : "ROOFTOP",
            "viewport" : {
               "northeast" : {
                  "lat" : 37.4238253802915,
                  "lng" : -122.0829009197085
               },
               "southwest" : {
                  "lat" : 37.4211274197085,
                  "lng" : -122.0855988802915
               }
            }
         },
         "place_id" : "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
         "types" : [ "street_address" ]
      }
   ],
   "status" : "OK"
}

###Schema 

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255),
  constraint usernameunique UNIQUE(username)
);
CREATE TABLE locations(
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(40),
  latitude NUMERIC(8,6),
  longitude NUMERIC(9,6),
  search_query VARCHAR(40),
  lat NUMERIC(8,6),
  lng NUMERIC(9,6),
  latsw NUMERIC(8,6),
  lngsw NUMERIC(9,6),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE events(
  id SERIAL PRIMARY KEY,
  date DATE,
  start_time TIME,
  title VARCHAR(255),
  description VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);