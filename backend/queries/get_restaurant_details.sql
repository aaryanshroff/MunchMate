SELECT
    r.restaurant_id,
    r.name,
    r.address,
    r.city,
    r.state,
    r.zip_code,
    r.phone,
    r.avg_rating,
    r.created_at,
    GROUP_CONCAT(ri.image_url) AS images
FROM Restaurants r
LEFT JOIN RestaurantImages ri ON r.restaurant_id = ri.restaurant_id
WHERE r.restaurant_id = ?
GROUP BY r.restaurant_id;
