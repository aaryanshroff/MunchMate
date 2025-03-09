-- Guaranteed to return 1 or 0 tuples since username is NOT NULL UNIQUE
SELECT uid
FROM Users
WHERE username = ?
    AND password_hash = ?;