import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(() => {
        const storedUserId = localStorage.getItem("userId");
        return storedUserId ? parseInt(storedUserId) : null;
    });
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        navigate(`/users/search?query=${encodeURIComponent(searchTerm)}`);
        setSearchTerm("");
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUserId = localStorage.getItem("userId");
            const parsedUserId = storedUserId ? parseInt(storedUserId) : null;
            setUserId(parsedUserId);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <nav className="navbar bg-body-tertiary px-3 mb-3">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-link text-decoration-none"
                    >
                        <h2 className="m-0">MunchMate</h2>
                    </button>
                    {userId && (
                        <button
                            onClick={() => navigate("/add-restaurant")}
                            className="btn btn-secondary ms-2"
                        >
                            Add Restaurant
                        </button>
                    )}
                    {userId && (
                        <button
                            onClick={() => navigate("/friends-recommendations")}
                            className="btn btn-secondary ms-2"
                        >
                            Next on the Menu
                        </button>
                    )}
                </div>
                <div className="d-flex align-items-center">
                    <div className="dropdown me-3">
                        <button
                            className="btn btn-secondary dropdown-toggle"
                            type="button"
                            id="profileDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <FaUserCircle size={24} />
                        </button>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="profileDropdown"
                        >
                            {userId ? (
                                <>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() =>
                                                navigate(`/profile/${userId}`)
                                            }
                                        >
                                            Profile
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                localStorage.removeItem(
                                                    "userId"
                                                );
                                                window.dispatchEvent(
                                                    new Event("storage")
                                                );
                                                navigate("/");
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() =>
                                                navigate("/register")
                                            }
                                        >
                                            Register
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => navigate("/login")}
                                        >
                                            Login
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div className="d-flex">
                        <input
                            type="text"
                            className="form-control form-control-sm me-2"
                            placeholder="Search usernames..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: "200px" }}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
