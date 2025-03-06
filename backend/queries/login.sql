-- Guaranteed to return 1 or 0 tuples since username is NOT NULL UNIQUE
SELECT uid,
    username,
    password_hash
FROM Users
WHERE username = ?
    AND password_hash = ?;