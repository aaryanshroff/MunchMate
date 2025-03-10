/*
 Check account lockout. 
 Accounts are locked out for 30 minutes if the last 3 failed login attempts occurred within 5 minutes of each other.
 Accounts with less than 3 failed login attempts are not locked out.
 */
-- CTE containing uid of the account if it exists (at most 1 tuple), empty otherwise
WITH ValidUid AS (
  SELECT uid
  FROM Users
  WHERE username = ?
)
SELECT
  /*
   Return TRUE if all of the following are true. FALSE otherwise
   1. The last 3 failed login attempts occurred in a span of 5 minutes (300 secs)
   2. It has been less than or equal to 30 minutes (1600 secs) since the last failed login attempt
   */
  (
    COUNT(*) = 3
    AND MAX(UNIXEPOCH(TIME)) - MIN(UNIXEPOCH(TIME)) <= 300
    AND UNIXEPOCH(CURRENT_TIMESTAMP) - MAX(UNIXEPOCH(TIME)) <= 900
  ) AS locked_out
FROM
  /* Subquery returns last 3 failed attempts */
  (
    SELECT time,
      success
    FROM LoginAttempts
    WHERE uid = (
        SELECT uid
        FROM ValidUid
      )
      AND success = FALSE
    ORDER BY time DESC
    LIMIT 3
  );