SELECT u.uid, u.username, u.first_name, u.last_name
FROM Followers f
JOIN Users u ON f.follower_id = u.uid
WHERE f.uid = ?;
