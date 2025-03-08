-- Create tables required by the application if they do not already exist
CREATE TABLE IF NOT EXISTS Users (
  uid INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Need to enforce decimal precision at application level, SQLite will treat DECIMAL(m,n) as REAL
CREATE TABLE IF NOT EXISTS Restaurants (
  restaurant_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  avg_rating DECIMAL(3, 2) NOT NULL CHECK(
    (avg_rating = 0)
    OR (
      avg_rating BETWEEN 1 AND 5
    )
  ),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, address)
);
CREATE TABLE IF NOT EXISTS RestaurantImages (
  image_id INTEGER PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS RestaurantTypes (
  type_id INTEGER PRIMARY KEY,
  type_name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS RestaurantTypeAssignments (
  restaurant_id INTEGER REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES RestaurantTypes(type_id) ON DELETE CASCADE,
  PRIMARY KEY(restaurant_id, type_id)
);
-- Need to enforce review length at application level, SQLite will treat VARCHAR(n) as TEXT
CREATE TABLE IF NOT EXISTS Reviews (
  uid INTEGER REFERENCES Users(uid) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(
    rating BETWEEN 1 AND 5
  ),
  review_text VARCHAR(250),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(uid, restaurant_id)
);
CREATE TABLE IF NOT EXISTS Followers (
  uid INTEGER REFERENCES Users(uid) ON DELETE CASCADE,
  follower_id INTEGER REFERENCES Users(uid) ON DELETE CASCADE,
  CHECK(uid <> follower_id),
  PRIMARY KEY(uid, follower_id)
);