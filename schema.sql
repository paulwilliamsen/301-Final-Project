DROP TABLE IF EXISTS users;
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);

INSERT INTO users (username, password) VALUES ('chris', 'paul');
