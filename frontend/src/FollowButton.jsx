import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";

function FollowButton() {
  // Get the profile user's id from the URL (this is the user being viewed)
  const { uid } = useParams();
  // Assume the current user id is stored in localStorage (adjust as needed)
  const currentUserId = localStorage.getItem("userId");

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if the current user is following the profile user
  useEffect(() => {
    if (!currentUserId) return;
    async function fetchFollowingStatus() {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${uid}/is-following`, {
          params: { follower_id: currentUserId },
        });
        if (response.status >= 200 && response.status < 300) {
          setIsFollowing(response.data.data);
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowingStatus();
  }, [uid, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      if (isFollowing) {
        // Unfollow
        const response = await axios.delete(`/api/users/${uid}/unfollow`, {
          data: { follower_id: currentUserId },
        });
        if (response.status >= 200 && response.status < 300) {
          setIsFollowing(false);
        } else {
          setError(response.data.error);
        }
      } else {
        // Follow
        const response = await axios.post(`/api/users/${uid}/follow`, {
          follower_id: currentUserId,
        });
        if (response.status >= 200 && response.status < 300) {
          setIsFollowing(true);
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If there's no current user, you might not show the button at all.
  if (!currentUserId) return null;

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default FollowButton;
