SELECT 
    rev.uid,
    rev.rating,
    rev.review_text,
    rev.created_at,
    u.username,
    u.first_name,
    u.last_name
FROM Reviews rev
JOIN Users u ON rev.uid = u.uid
WHERE rev.restaurant_id = ?
ORDER BY rev.created_at DESC
LIMIT ?;
