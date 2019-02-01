DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

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
  uID INT,
  FOREIGN KEY (uID) REFERENCES users (id)
);
