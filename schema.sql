DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);
CREATE TABLE locations(
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(40),
  latitude NUMERIC(8,6),
  longitude NUMERIC(9,6),
  search_query VARCHAR(40),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO users (username, password) VALUES ('chris', 'paul');
