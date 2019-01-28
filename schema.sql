DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255),
  location_id INTEGER(2)
  FOREIGN KEY (location_id) REFERENCES location (id)
);
CREATE TABLE locations(
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(40),
  latitude NUMERIC(9,9).
  longitude NUMERIC(9,9),
  search_query VARCHAR(40)
);

INSERT INTO users (username, password) VALUES ('chris', 'paul');
