SELECT r.restaurant_id, r.name, r.address, r.city, r.state, r.zip_code, r.phone,
       rev.rating, rev.review_text, rev.created_at
FROM Reviews rev
JOIN Restaurants r ON rev.restaurant_id = r.restaurant_id
WHERE rev.uid = ?;
