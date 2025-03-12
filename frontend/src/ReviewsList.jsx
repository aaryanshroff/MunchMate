import { useState, useEffect } from "react";
import axios from "axios";

function ReviewsList({ title, apiUrl }) {
    const [limit, setLimit] = useState(10);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchReviews() {
            try {
                setIsLoading(true);
                const response = await axios.get(apiUrl, {
                    params: { limit },
                });
                if (response.status >= 200 && response.status < 300) {
                    setReviews(response.data.data);
                } else {
                    setError(response.data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, [apiUrl, limit]);

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value, 10));
    };

    return (
        <div className="container my-4">
            <h2>{title}</h2>
            <div className="mb-3">
                <select
                    id={`${title}-limitSelect`}
                    className="form-select"
                    value={limit}
                    onChange={handleLimitChange}
                >
                    <option value={10}>Last 10</option>
                    <option value={20}>Last 20</option>
                    <option value={50}>Last 50</option>
                </select>
            </div>
            {isLoading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!isLoading && reviews.length === 0 && <p>No reviews found.</p>}
            {reviews.map((review, index) => (
                <div key={index} className="card mb-3 p-3">
                    {review.username && (
                        <h5>
                            {review.username} ({review.first_name}{" "}
                            {review.last_name})
                        </h5>
                    )}
                    <p>
                        <strong>Restaurant:</strong> {review.name}
                    </p>
                    <p>
                        <strong>Review:</strong> {review.review_text}
                    </p>
                    <p>
                        <strong>Rating:</strong> {review.rating}
                    </p>
                    <p>
                        <strong>Reviewed at:</strong>{" "}
                        {new Date(review.created_at).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default ReviewsList;
