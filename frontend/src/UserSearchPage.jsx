import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import axios from "axios";

function UserSearchPage() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get("query") || "";
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        try {
            const response = await axios.get("/api/users/search", {
                params: { query },
            });
            if (response.status >= 200 && response.status < 300) {
                setResults(response.data.data);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (initialQuery) {
            handleSearch();
        }
    }, [initialQuery]);

    return (
        <div className="container my-4">
            <h2>Search Users</h2>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {results.length > 0 ? (
                <ul className="list-group">
                    {results.map((user) => (
                        <li
                            key={user.uid}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                {user.username} - {user.first_name}{" "}
                                {user.last_name}
                            </div>
                            <Link
                                to={`/profile/${user.uid}`}
                                className="btn btn-sm btn-outline-primary"
                            >
                                View Profile
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
}

export default UserSearchPage;
