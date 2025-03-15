-- R6 Add restaurants and reviews (DJ)
-- Adding a Restaurant Query
INSERT INTO Restaurants (
    name,
    address,
    city,
    state,
    zip_code,
    phone,
    avg_rating
  )
VALUES (
    'McDonalds',
    '123 Rose St',
    'Toronto',
    'ON',
    '11111',
    '111-111-1111',
    0.0
  );
INSERT INTO RestaurantImages (image_id, restaurant_id, image_url)
VALUES (999, 1, 'image_url');
-- Adding a Review Query
INSERT INTO Reviews (uid, restaurant_id, rating, review_text)
VALUES (1, 1587, 5, 'great store');
-- Finding 10 most recent reviews for a Restaurant Query to show on the page with restaurant_id = 1587:
SELECT uid,
  rating,
  review_text,
  created_at
FROM Reviews
WHERE restaurant_id = 1587
ORDER BY created_at DESC
LIMIT 10;
-- to minimize output file size
-- Finding the user uid=1's reviews for a restaurant with restaurant_id = 1587:
SELECT rating,
  review_text,
  created_at
FROM Reviews
WHERE restaurant_id = 1587
  AND uid = 1
LIMIT 10;
-- to minimize output file size
-- R8 Average reviews functionality
SELECT r.restaurant_id,
  COALESCE(ROUND(avg(rv.rating), 1), 0) AS avg_rating
FROM Restaurants r
  LEFT JOIN Reviews rv ON r.restaurant_id = rv.restaurant_id
GROUP BY r.restaurant_id
LIMIT 10;
-- to minimize output file size
-- R9 Create account and login, with account lockout for multiple failed logins
-- 1. Create account
INSERT INTO Users (
    username,
    first_name,
    last_name,
    email,
    password_hash
  )
VALUES (
    'KevinIsCool',
    'Kevin',
    'Nguyen',
    'asteroid.destroyer@gmail.com',
    '97c94ebe5d767a353b77f3c0ce2d429741f2e8c99473c3c150e2faa3d14c9da6'
  );
-- 2. Login
-- Guaranteed to return 1 or 0 tuples since username is NOT NULL UNIQUE
SELECT uid,
  password_hash = '97c94ebe5d767a353b77f3c0ce2d429741f2e8c99473c3c150e2faa3d14c9da6' AS authenticated
FROM Users
WHERE username = 'KevinIsCool'
LIMIT 10;
-- to minimize output file size
/*
 3. Check account lockout. 
 Accounts are locked out for 30 minutes if the last 3 failed login attempts occurred within 5 minutes of each other.
 Accounts with less than 3 failed login attempts are not locked out.
 */
SELECT
  /*
   Return TRUE if all of the following are true. FALSE otherwise
   1. The last 3 failed login attempts within 40 minutes (2400 secs) occurred in a span of 5 minutes (300 secs)
   2. It has been less than or equal to 30 minutes (1600 secs) since the last failed login attempt
   */
  (
    COUNT(*) = 3
    AND MAX(UNIXEPOCH(TIME)) - MIN(UNIXEPOCH(TIME)) <= 300
    AND UNIXEPOCH(CURRENT_TIMESTAMP) - MAX(UNIXEPOCH(TIME)) <= 1600
  ) AS locked_out
FROM
  /* Subquery returns last 3 failed attempts */
  (
    SELECT time,
      success
    FROM LoginAttempts
    WHERE uid = (
        SELECT uid
        FROM Users
        WHERE username = 'KevinIsCool'
      )
      AND time > UNIXEPOCH(CURRENT_TIMESTAMP) - 2400
      AND success = FALSE
    ORDER BY time DESC
    LIMIT 3
  )
LIMIT 10;
-- to minimize output file size
/*
 4. Record login attempt. Login attempts are only recorded 
 when a valid username is provided by the user and the account is not locked out.
 */
INSERT INTO LoginAttempts (uid, success)
VALUES (1001, 1);
-- R10 Profile Page and Follow Functionality
-- Search for specific username like abc
SELECT uid,
  username,
  first_name,
  last_name,
  email,
  created_at
FROM Users
WHERE username LIKE '%joe%'
LIMIT 10;
-- to minimize output file size
-- Get Profile Details of User with UID 913
SELECT uid,
  username,
  first_name,
  last_name,
  email,
  created_at
FROM Users
WHERE uid = 913
LIMIT 10;
-- to minimize output file size
-- List Following of User with UID 913
SELECT u.uid,
  u.username,
  u.first_name,
  u.last_name
FROM Followers f
  JOIN Users u ON f.uid = u.uid
WHERE f.follower_id = 913
LIMIT 10;
-- to minimize output file size
-- List 3 most recent reviews of User with UID 913
SELECT r.restaurant_id,
  r.name,
  r.address,
  r.city,
  r.state,
  r.zip_code,
  r.phone,
  rev.rating,
  rev.review_text,
  rev.created_at
FROM Reviews rev
  JOIN Restaurants r ON rev.restaurant_id = r.restaurant_id
WHERE rev.uid = 913
ORDER BY rev.created_at DESC
LIMIT 3;
-- List 3 most recent reviews from following of User with UID 913
SELECT r.restaurant_id,
  r.name,
  rev.uid AS review_uid,
  rev.rating,
  rev.review_text,
  rev.created_at,
  u.username,
  u.first_name,
  u.last_name
FROM Reviews rev
  JOIN Restaurants r ON rev.restaurant_id = r.restaurant_id
  JOIN Users u ON rev.uid = u.uid
WHERE rev.uid IN (
    SELECT uid
    FROM Followers
    WHERE follower_id = 913
  )
ORDER BY rev.created_at DESC
LIMIT 3;
-- R7 List all restaurants and filter restaurants by city and type (Aaryan)
-- 1. List all restaurants
SELECT restaurant_id,
  name,
  address,
  city,
  state,
  zip_code,
  phone
FROM Restaurants
ORDER BY name
LIMIT 10;
-- to minmize output file size
-- 2. Generate filter options
SELECT DISTINCT (city)
FROM Restaurants
ORDER BY city;
SELECT DISTINCT (type_name)
FROM RestaurantTypes
ORDER BY type_name
LIMIT 10;
-- to minimize output file size
-- 3. Filter restaurants by a city and any number of cuisines
SELECT r.restaurant_id,
  r.name,
  r.address,
  r.city,
  r.state,
  r.zip_code,
  r.phone,
  GROUP_CONCAT(rt.type_name) AS types
FROM Restaurants r
  INNER JOIN RestaurantTypeAssignments rta ON r.restaurant_id = rta.restaurant_id
  INNER JOIN RestaurantTypes rt ON rta.type_id = rt.type_id
WHERE r.city = 'Edmonton'
  AND rt.type_name IN ('Pizza', 'Chinese')
GROUP BY r.restaurant_id -- In SQLite, you can use any attribute in SELECT if you GROUP BY a primary key
ORDER BY r.name
LIMIT 10;
-- to minimize output file size