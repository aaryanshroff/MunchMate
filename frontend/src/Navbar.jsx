import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Navbar = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(() => {
        const storedUserId = localStorage.getItem("userId");
        return storedUserId ? parseInt(storedUserId) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUserId = localStorage.getItem("userId");
            const parsedUserId = storedUserId ? parseInt(storedUserId) : null;
            console.log("Storage changed, new userId:", parsedUserId);
            setUserId(parsedUserId);
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        console.log("userId state updated:", userId);
        localStorage.setItem("userId", userId);
        window.dispatchEvent(new Event("storage"));
    }, [userId]);

    return (
        <div className="navbar bg-body-tertiary px-3 mb-3">
            <ul className="nav nav-pills">
                <div onClick={() => navigate("/")} className="btn">
                    MunchMate
                </div>
                <div
                    onClick={() => navigate("/add-restaurant")}
                    className="btn btn-secondary"
                >
                    Add Restaurant
                </div>
                <div
                    onClick={() => {
                        navigate(`/profile/${userId}`);
                    }}
                    className="btn btn-secondary"
                    hidden={!userId}
                >
                    Profile
                </div>
                <div
                    onClick={() => navigate("/register")}
                    className="btn btn-secondary"
                    hidden={userId}
                >
                    Register
                </div>
                <div
                    onClick={() => navigate("/login")}
                    className="btn btn-secondary"
                    hidden={userId}
                >
                    Login
                </div>
                <div
                    onClick={() => {
                        setUserId(0);
                        navigate("/login");
                    }}
                    className="btn btn-secondary"
                    hidden={!userId}
                >
                    Logout
                </div>
            </ul>
        </div>
    );
};

export default Navbar;
