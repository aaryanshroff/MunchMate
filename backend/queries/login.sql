-- Guaranteed to return 1 or 0 tuples since username is NOT NULL UNIQUE
SELECT uid,
    password_hash = ? AS authenticated
FROM Users
WHERE username = ?