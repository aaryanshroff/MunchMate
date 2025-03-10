INSERT INTO Reviews (uid, restaurant_id, rating, review_text)
VALUES (?, ?, ?, ?)
ON CONFLICT(uid, restaurant_id)
DO UPDATE SET rating = excluded.rating,
              review_text = excluded.review_text,
              created_at = CURRENT_TIMESTAMP;
