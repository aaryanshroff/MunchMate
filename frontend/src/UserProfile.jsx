import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import axios from "axios";

function Profile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setIsLoading(true);
        // Fetch basic profile details
        const profileResponse = await axios.get(`/api/users/${uid}`);
        if (profileResponse.status >= 200 && profileResponse.status < 300) {
          setProfile(profileResponse.data.data);
        } else {
          setError(profileResponse.data.error);
          return;
        }

        // Fetch followers
        const followersResponse = await axios.get(`/api/users/${uid}/followers`);
        if (followersResponse.status >= 200 && followersResponse.status < 300) {
          setFollowers(followersResponse.data.data);
        } else {
          setError(followersResponse.data.error);
          return;
        }

        // Fetch following
        const followingResponse = await axios.get(`/api/users/${uid}/following`);
        if (followingResponse.status >= 200 && followingResponse.status < 300) {
          setFollowing(followingResponse.data.data);
        } else {
          setError(followingResponse.data.error);
          return;
        }

        // Fetch reviews
        const reviewsResponse = await axios.get(`/api/users/${uid}/reviews`);
        if (reviewsResponse.status >= 200 && reviewsResponse.status < 300) {
          setReviews(reviewsResponse.data.data);
        } else {
          setError(reviewsResponse.data.error);
          return;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfileData();
  }, [uid]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      {profile && (
        <div className="my-4">
          <h1>{profile.username}&apos;s Profile</h1>
          <p>
            <strong>Name:</strong> {profile.first_name} {profile.last_name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="row my-4">
        <div className="col-md-6">
          <h2>Followers</h2>
          <ul className="list-group">
            {followers.map((user) => (
              <li key={user.uid} className="list-group-item">
                <Link to={`/profile/${user.uid}`}>
                  {user.username} - {user.first_name} {user.last_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6">
          <h2>Following</h2>
          <ul className="list-group">
            {following.map((user) => (
              <li key={user.uid} className="list-group-item">
                <Link to={`/profile/${user.uid}`}>
                  {user.username} - {user.first_name} {user.last_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="my-4">
        <h2>Reviewed Restaurants</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Zip Code</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Reviewed At</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr key={index}>
                    <td>{review.name}</td>
                    <td>{review.phone}</td>
                    <td>{review.address}</td>
                    <td>{review.city}</td>
                    <td>{review.state}</td>
                    <td>{review.zip_code}</td>
                    <td>{review.rating}</td>
                    <td>{review.review_text}</td>
                    <td>
                      {new Date(review.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;