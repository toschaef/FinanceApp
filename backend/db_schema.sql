CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE items (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  access_token VARCHAR(255) NOT NULL,
  institution_id VARCHAR(255),
  bank_name VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  account_balance DECIMAL(18,2) NOT NULL,
  iso_currency_code VARCHAR(50),
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  account_subtype VARCHAR(50) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (item_id, account_id)
);