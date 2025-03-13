SELECT 
    r.restaurant_id,
    COALESCE( ROUND( avg( rv.rating ), 1 ), 0 ) AS avg_rating
FROM Restaurants r
LEFT JOIN Reviews rv ON r.restaurant_id = rv.restaurant_id
GROUP BY r.restaurant_id;
