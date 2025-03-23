// FriendsRecommendations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const FriendsRecommendations = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            setError("User not logged in");
            return;
        }
        fetch(`/api/users/${userId}/friends-restaurants?limit=10`)
            .then((response) => response.json())
            .then((data) => {
                if (data.data) {
                    setRecommendations(data.data);
                } else {
                    setError(data.error || "Error fetching recommendations");
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Error fetching recommendations");
            });
    }, [userId]);

    if (error) {
        return <div className="container mt-4 alert alert-danger">{error}</div>;
    }

    if (recommendations.length === 0) {
        return <div className="container mt-4">Loading recommendations...</div>;
    }

    // Custom inline styles for carousel control icons
    const controlIconStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "50%",
        opacity: 1, // make sure the icon is fully visible
    };

    return (
        <div className="container mt-4">
            <h3>Recommended Restaurants to visit based on your friends!</h3>
            <div
                id="recommendationCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
            >
                <div className="carousel-inner">
                    {recommendations.map((restaurant, index) => (
                        <div
                            key={restaurant.restaurant_id}
                            className={`carousel-item ${
                                index === 0 ? "active" : ""
                            }`}
                        >
                            <div
                                className="card mx-auto"
                                style={{ maxWidth: "500px" }}
                            >
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {restaurant.name}
                                    </h5>
                                    <p className="card-text">
                                        {restaurant.address}, {restaurant.city},{" "}
                                        {restaurant.state} {restaurant.zip_code}
                                        <br />
                                        Phone: {restaurant.phone}
                                        <br />
                                        Rating: {restaurant.avg_rating}
                                        <br />
                                        Visited by {
                                            restaurant.friend_visits
                                        }{" "}
                                        {restaurant.friend_visits === 1
                                            ? "person"
                                            : "people"}{" "}
                                        you know!
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            navigate(
                                                `/restaurant/${restaurant.restaurant_id}`
                                            )
                                        }
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#recommendationCarousel"
                    data-bs-slide="prev"
                >
                    <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                        style={controlIconStyle}
                    ></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#recommendationCarousel"
                    data-bs-slide="next"
                >
                    <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                        style={controlIconStyle}
                    ></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    );
};

export default FriendsRecommendations;
