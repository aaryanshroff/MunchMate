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
VALUES (1, 1, 5, 'great store');

-- Finding all reviews for a Restaurant Query to show on the page:
SELECT uid,
  rating,
  review_text,
  created_at
FROM Reviews
WHERE restaurant_id = 1;

-- Finding the user uid=1's reviews for a restaurant:
SELECT rating,
  review_text,
  created_at
FROM Reviews
WHERE restaurant_id = 1
  AND uid = 1;

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
ORDER BY name;

-- 2. Generate filter options
SELECT DISTINCT (city)
FROM Restaurants
ORDER BY city;

SELECT DISTINCT (type_name)
FROM RestaurantTypes
ORDER BY type_name;

-- 3. List restaurants from city :city
SELECT restaurant_id,
  name,
  address,
  city,
  state,
  zip_code,
  phone
FROM Restaurants
WHERE city = 'Phoenix';

-- 4. List restaurants of type :type_name
SELECT Restaurants.*
FROM Restaurants
  INNER JOIN RestaurantTypeAssignments ON Restaurants.restaurant_id = RestaurantTypeAssignments.restaurant_id
  INNER JOIN RestaurantTypes ON RestaurantTypeAssignments.type_id = RestaurantTypes.type_id
WHERE RestaurantTypes.type_name = 'augue';

-- 5. Get average rating of each restaurant
SELECT restaurant_id,
  COALESCE(ROUND(AVG(rating)), 0) AS avg_rating
FROM Reviews
GROUP BY restaurant_id;

-- R9 Create account and login, includes account lockout for multiple failed logins
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
    '8inGIJogZE+su8Trdm1FcGXnyoLUu80vZhp8lv6LM64'
  );

/*
 2. Check account lockout. 
 Accounts are locked out for 30 minutes if the last 3 failed login attempts occurred within 5 minutes of each other.
 Accounts with less than 3 failed login attempts are not locked out.
 */
-- CTE containing uid of the account if it exists (at most 1 tuple), empty otherwise
WITH ValidUid AS (
  SELECT uid
  FROM Users
  WHERE username = 'KevinIsCool'
)
SELECT
  /*
   Return TRUE if all of the following are true. FALSE otherwise
   1. The last 3 failed login attempts occurred in a span of 5 minutes (300 secs)
   2. It has been less than or equal to 30 minutes (1600 secs) since the last failed login attempt
   */
  (
    COUNT(*) = 3
    AND MAX(UNIXEPOCH(TIME)) - MIN(UNIXEPOCH(TIME)) <= 300
    AND UNIXEPOCH(CURRENT_TIMESTAMP) - MAX(UNIXEPOCH(TIME)) <= 900
  ) AS locked_out
FROM
  /* Subquery returns last 3 failed attempts */
  (
    SELECT time,
      success
    FROM LoginAttempts
    WHERE uid = (
        SELECT uid
        FROM ValidUid
      )
      AND success = FALSE
    ORDER BY time DESC
    LIMIT 3
  );

/*
 3. Record login attempt. Login attempts are only recorded 
 when a valid username is provided by the user and the account is not locked out.
 */
INSERT INTO LoginAttempts (uid, success)
VALUES (3, TRUE);

-- 4. Login
SELECT uid,
  username,
  password_hash
FROM Users
WHERE username = 'KevinIsCool'
  AND password_hash = '8inGIJogZE+su8Trdm1FcGXnyoLUu80vZhp8lv6LM64';