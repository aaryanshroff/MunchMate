WITH Friends AS (
    SELECT uid AS friend_id
    FROM Followers
    WHERE follower_id = ?
    UNION
    SELECT follower_id AS friend_id
    FROM Followers
    WHERE uid = ?
)
SELECT r.restaurant_id,
       r.name,
       r.address,
       r.city,
       r.state,
       r.zip_code,
       r.phone,
       r.avg_rating,
       COUNT(*) AS friend_visits
FROM Reviews rev
JOIN Friends f ON rev.uid = f.friend_id
JOIN Restaurants r ON rev.restaurant_id = r.restaurant_id
WHERE r.restaurant_id NOT IN (
    SELECT restaurant_id FROM Reviews WHERE uid = ?
)
GROUP BY r.restaurant_id
ORDER BY friend_visits DESC
LIMIT ?;
