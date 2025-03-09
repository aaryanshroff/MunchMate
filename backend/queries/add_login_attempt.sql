/*
 Record login attempt. Login attempts are only recorded 
 when a valid username is provided by the user and the account is not locked out.
 */
INSERT INTO LoginAttempts (uid, success)
VALUES (?, ?);