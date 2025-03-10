import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import axios from "axios";
import ReviewsList from "./ReviewsList.jsx";
import FollowButton from "./FollowButton.jsx";

function Profile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserId = localStorage.getItem("userId");

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>{profile.username}'s Profile</h1>
            {(uid != currentUserId) && <FollowButton />}
          </div>
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

      <ReviewsList
        title="My Reviews"
        apiUrl={`/api/users/${uid}/reviews`}
      />

      <ReviewsList
        title="Friends' Reviews"
        apiUrl={`/api/users/${uid}/friends-reviews`}
      />
    </div>
  );
}

export default Profile;