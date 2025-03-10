SELECT 
    r.restaurant_id, 
    r.name, 
    r.address, 
    r.city, 
    r.state, 
    r.zip_code, 
    r.phone,
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
    SELECT uid FROM Followers WHERE follower_id = ?
)
ORDER BY rev.created_at DESC
LIMIT ?;