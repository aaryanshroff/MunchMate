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

-- Finding the user uid=1's reviews for a restaurant with restaurant_id = 1587:
SELECT rating,
  review_text,
  created_at
FROM Reviews
WHERE restaurant_id = 1587
  AND uid = 1;

-- R8 Average reviews functionality
SELECT 
    r.restaurant_id,
    COALESCE( ROUND( avg( rv.rating ), 1 ), 0 ) AS avg_rating
FROM Restaurants r
LEFT JOIN Reviews rv ON r.restaurant_id = rv.restaurant_id
GROUP BY r.restaurant_id;

-- R10 Profile Page and Follow Functionality
-- Search for specific username like abc
SELECT 
    uid, 
    username, 
    first_name, 
    last_name, 
    email, 
    created_at
FROM Users
WHERE username LIKE '%joe%';

-- Get Profile Details of User with UID 913
SELECT uid, username, first_name, last_name, email, created_at
FROM Users
WHERE uid = 913;

-- List Following of User with UID 913
SELECT u.uid, u.username, u.first_name, u.last_name
FROM Followers f
JOIN Users u ON f.uid = u.uid
WHERE f.follower_id = 913;

-- List 3 most recent reviews of User with UID 913
SELECT r.restaurant_id, r.name, r.address, r.city, r.state, r.zip_code, r.phone,
       rev.rating, rev.review_text, rev.created_at
FROM Reviews rev
JOIN Restaurants r ON rev.restaurant_id = r.restaurant_id
WHERE rev.uid = 913
ORDER BY rev.created_at DESC
LIMIT 3;

-- List 3 most recent reviews from following of User with UID 913
SELECT 
    r.restaurant_id, 
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
    SELECT uid FROM Followers WHERE follower_id = 913
)
ORDER BY rev.created_at DESC
LIMIT 3;
