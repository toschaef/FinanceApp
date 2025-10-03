drop table if exists investment_transactions, investments, transactions, assets, accounts, items, users;

create table users (
  id int auto_increment,
  email varchar(255),
  password varchar(255),
  needs_update boolean default true,
  primary key (id)
);

create table items (
  id int auto_increment,
  user_id int,
  item_id varchar(255),
  access_token varchar(255),
  institution_id varchar(255),
  bank_name varchar(255),
  transactions_cursor varchar(255) default '',
  investments_cursor varchar(255) default '',
  primary key (id),
  unique (item_id),
  foreign key (user_id) references users(id) on delete cascade
);

create table accounts (
  id int auto_increment primary key,
  user_id int,
  item_id varchar(255),
  account_id varchar(255),
  account_balance decimal(18,2),
  iso_currency_code varchar(10) default 'USD',
  account_name varchar(255),
  account_type varchar(50),
  account_subtype varchar(50),
  institution_name varchar(255),
  mask char(4),
  unique (account_id),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (item_id) references items(item_id) on delete cascade
);

create table transactions (
  id int auto_increment primary key,
  user_id int,
  item_id varchar(255),
  account_id varchar(255),
  amount decimal(18,2),
  transaction_name varchar(255),
  iso_currency_code varchar(10) default 'USD',
  transaction_date date,
  account_name varchar(255),
  payment_channel varchar(50),
  transaction_subtype varchar(50),
  institution_name varchar(255),
  finance_category varchar(255),
  mask char(4),
  lat decimal(9,6),
  lng decimal(9,6),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (item_id) references items(item_id) on delete cascade,
  foreign key (account_id) references accounts(account_id) on delete cascade
);

create table investments (
  id int auto_increment primary key,
  user_id int,
  item_id varchar(255),
  account_id varchar(255),
  security_id varchar(255),
  quantity decimal(18,4),
  institution_price decimal(18,4),
  institution_value decimal(18,2),
  iso_currency_code varchar(10) default 'USD',
  investment_name varchar(255),
  ticker_symbol varchar(20),
  institution_name varchar(255),
  account_name varchar(255),
  mask char(4),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (item_id) references items(item_id) on delete cascade,
  foreign key (account_id) references accounts(account_id) on delete cascade
);

create table investment_transactions (
  id int auto_increment primary key,
  user_id int,
  item_id varchar(255),
  account_id varchar(255),
  investment_transaction_id varchar(255),
  security_id varchar(255),
  type varchar(50),
  subtype varchar(50),
  transaction_date date,
  amount decimal(18,2),
  price decimal(18,4),
  quantity decimal(18,4),
  iso_currency_code varchar(10) default 'usd',
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (item_id) references items(item_id) on delete cascade,
  foreign key (account_id) references accounts(account_id) on delete cascade
);

create table assets (
  asset_id int auto_increment primary key,
  user_id int,
  estimated_value decimal(18,2),
  quantity int default 1,
  amount decimal(18,2),
  asset_name varchar(255),
  acquisition_date date,
  iso_currency_code varchar(10) default 'USD',
  bio text,
  foreign key (user_id) references users(id) on delete cascade
);