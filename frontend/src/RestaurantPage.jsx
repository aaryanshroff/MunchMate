import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";

function RestaurantPage() {
    const { restaurant_id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // For reviews section
    const [myReview, setMyReview] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    const [reviewsLimit, setReviewsLimit] = useState(10);
    const [restaurantReviews, setRestaurantReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Assume current user id is stored in localStorage.
    const currentUserId = localStorage.getItem("userId");

    useEffect(() => {
        async function fetchRestaurant() {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `/api/restaurants/${restaurant_id}`
                );
                if (response.status >= 200 && response.status < 300) {
                    setRestaurant(response.data.data);
                } else {
                    setError(response.data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRestaurant();
    }, [restaurant_id]);

    // Fetch the current user's review for this restaurant
    useEffect(() => {
        if (!currentUserId) return;
        async function fetchMyReview() {
            try {
                const response = await axios.get(
                    `/api/restaurants/${restaurant_id}/my-review`,
                    { params: { uid: currentUserId } }
                );
                if (response.status >= 200 && response.status < 300) {
                    setMyReview(response.data.data);
                    // If a review exists, prefill the fields (optional)
                    if (response.data.data) {
                        setRating(response.data.data.rating);
                        setReviewText(response.data.data.review_text);
                    }
                } else {
                    setSubmitError(response.data.error);
                }
            } catch (err) {
                setSubmitError(err.message);
            }
        }
        fetchMyReview();
    }, [restaurant_id, currentUserId]);

    // Fetch restaurant reviews (all users) with limit
    useEffect(() => {
        async function fetchRestaurantReviews() {
            try {
                setReviewsLoading(true);
                const response = await axios.get(
                    `/api/restaurants/${restaurant_id}/reviews`,
                    { params: { limit: reviewsLimit } }
                );
                if (response.status >= 200 && response.status < 300) {
                    setRestaurantReviews(response.data.data);
                } else {
                    setError(response.data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setReviewsLoading(false);
            }
        }
        fetchRestaurantReviews();
    }, [restaurant_id, reviewsLimit]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(null);
        if (reviewText.length > 150) {
            setSubmitError("Review must be 150 characters or less");
            return;
        }
        try {
            const response = await axios.post(
                `/api/restaurants/${restaurant_id}/review`,
                {
                    uid: currentUserId,
                    rating,
                    review_text: reviewText,
                }
            );
            if (response.status >= 200 && response.status < 300) {
                setSubmitSuccess("Review saved successfully!");
                // Update myReview state with the submitted review
                setMyReview({
                    uid: currentUserId,
                    rating,
                    review_text: reviewText,
                    created_at: new Date().toISOString(),
                });
                // Optionally, refresh the reviews list
            } else {
                setSubmitError(response.data.error);
            }
        } catch (err) {
            setSubmitError(err.message);
        }
    };

    return (
        <div className="container my-4">
            {isLoading && <p>Loading restaurant details...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {restaurant && (
                <>
                    <h1>{restaurant.name}</h1>
                    <p>
                        <strong>Address:</strong> {restaurant.address},{" "}
                        {restaurant.city}, {restaurant.state}{" "}
                        {restaurant.zip_code}
                    </p>
                    <p>
                        <strong>Phone:</strong> {restaurant.phone}
                    </p>
                    <p>
                        <strong>Average Rating:</strong> {restaurant.avg_rating}
                    </p>
                    <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(restaurant.created_at).toLocaleString()}
                    </p>
                    <h3>Images</h3>
                    <div className="d-flex flex-wrap">
                        {restaurant.images ? (
                            restaurant.images.split(",").map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${restaurant.name} ${index}`}
                                    style={{
                                        maxWidth: "200px",
                                        marginRight: "10px",
                                        marginBottom: "10px",
                                    }}
                                />
                            ))
                        ) : (
                            <p>No images available.</p>
                        )}
                    </div>

                    <hr />

                    {/* Review Section */}
                    <h2>Your Review</h2>
                    {currentUserId ? (
                        <>
                            {myReview ? (
                                <div className="card p-3 mb-3">
                                    <h5>
                                        Your Review (Posted on{" "}
                                        {new Date(
                                            myReview.created_at
                                        ).toLocaleString()}
                                        ):
                                    </h5>
                                    <p>
                                        <strong>Rating:</strong>{" "}
                                        {myReview.rating}
                                    </p>
                                    <p>
                                        <strong>Review:</strong>{" "}
                                        {myReview.review_text}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                        <label
                                            htmlFor="rating"
                                            className="form-label"
                                        >
                                            Rating:
                                        </label>
                                        <select
                                            id="rating"
                                            className="form-select form-select-sm"
                                            value={rating}
                                            onChange={(e) =>
                                                setRating(
                                                    parseInt(e.target.value, 10)
                                                )
                                            }
                                        >
                                            {[1, 2, 3, 4, 5].map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label
                                            htmlFor="reviewText"
                                            className="form-label"
                                        >
                                            Your Review (max 150 characters):
                                        </label>
                                        <textarea
                                            id="reviewText"
                                            className="form-control"
                                            value={reviewText}
                                            onChange={(e) =>
                                                setReviewText(e.target.value)
                                            }
                                            maxLength="150"
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    {submitError && (
                                        <div className="alert alert-danger">
                                            {submitError}
                                        </div>
                                    )}
                                    {submitSuccess && (
                                        <div className="alert alert-success">
                                            {submitSuccess}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Submit Review
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <p>You must be logged in to post a review.</p>
                    )}

                    <hr />

                    {/* Section to display recent reviews */}
                    <h2>Recent Reviews</h2>
                    <div className="mb-3">
                        <label htmlFor="reviewsLimit" className="form-label">
                            Show Reviews:
                        </label>
                        <select
                            id="reviewsLimit"
                            className="form-select form-select-sm"
                            value={reviewsLimit}
                            onChange={(e) =>
                                setReviewsLimit(parseInt(e.target.value, 10))
                            }
                            style={{ width: "150px" }}
                        >
                            <option value={10}>Top 10</option>
                            <option value={20}>Top 20</option>
                            <option value={50}>Top 50</option>
                        </select>
                    </div>
                    {reviewsLoading && <p>Loading reviews...</p>}
                    {restaurantReviews.length === 0 && !reviewsLoading ? (
                        <p>No reviews yet.</p>
                    ) : (
                        restaurantReviews.map((review, index) => (
                            <div key={index} className="card mb-3 p-3">
                                <h5>
                                    {review.username} ({review.first_name}{" "}
                                    {review.last_name})
                                </h5>
                                <p>
                                    <strong>Rating:</strong> {review.rating}
                                </p>
                                <p>
                                    <strong>Review:</strong>{" "}
                                    {review.review_text}
                                </p>
                                <p>
                                    <strong>Reviewed at:</strong>{" "}
                                    {new Date(
                                        review.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}

export default RestaurantPage;
