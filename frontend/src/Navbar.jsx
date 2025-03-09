import { useNavigate } from "react-router";

// TODO @djhoon24: Integrate currentUserId with the actual logged in userId (we should put this in local storage this when we login to a user)
const currentUserId = 1;
// TODO @dyasin: Don't display certain buttons if we are not admin
const Navbar = () => {
    let navigate = useNavigate();
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
                    onClick={() => navigate(`/profile/${currentUserId}`)}
                    className="btn btn-secondary"
                >
                    Profile
                </div>
                <div
                    onClick={() => navigate("/register")}
                    className="btn btn-secondary"
                >
                    Register
                </div>
                <div
                    onClick={() => navigate("/login")}
                    className="btn btn-secondary"
                >
                    Login
                </div>
            </ul>
        </div>
    );
};

export default Navbar;
