import { useState, useEffect } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router";

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const [error, setError] = useState("");
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const navigate = useNavigate();
    const [userId, setUserId] = useState(
        parseInt(JSON.parse(localStorage.getItem("userId")))
    );

    useEffect(() => {
        if (userId) {
            localStorage.setItem("userId", JSON.stringify(userId));
            window.dispatchEvent(new Event("storage"));
        }
    }, [userId]);

    // Redirect to profile page if user is already logged in
    useEffect(() => {
        if (userId) {
            navigate("/profile/" + userId);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const isValidEmail = (email) => {
        const VALID_EMAIL_REGEX =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return VALID_EMAIL_REGEX.test(email);
    };

    const isPasswordMatching = (password, confirm_password) => {
        return password == confirm_password;
    };

    const isValidInput = () => {
        const isAllFormDataFilledOut = Object.entries(formData).every(
            ([key, value]) => {
                console.log(key + " " + value);
                return value.trim() !== "";
            }
        );

        if (!isAllFormDataFilledOut) {
            setError("Please fill out the required fields");
            return false;
        }

        if (!isValidEmail(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!isPasswordMatching(formData.password, formData.confirm_password)) {
            setError("Please enter matching passwords");
            return false;
        }

        return true;
    };

    // Gives success/error feedback to the user after they try to log in
    const handleErrorResponseToast = document.getElementById(
        "handleErrorResponseToast"
    );
    const handleSuccessResponseToast = document.getElementById(
        "handleSuccessResponseToast"
    );

    if (handleErrorResponseToast) {
        handleErrorResponseToast.addEventListener("hidden.bs.toast", () => {
            setButtonDisabled(false);
        });
    }
    if (handleSuccessResponseToast) {
        handleSuccessResponseToast.addEventListener("hidden.bs.toast", () => {
            setButtonDisabled(false);
            navigate(`/login`);
        });
    }

    const handleErrorResponseToastBootstrap =
        bootstrap.Toast.getOrCreateInstance(handleErrorResponseToast);
    const handleSuccessResponseToastBootstrap =
        bootstrap.Toast.getOrCreateInstance(handleSuccessResponseToast);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidInput()) {
            handleErrorResponseToastBootstrap.show();
            return;
        }
        let response = "";

        try {
            response = await axios.post("/api/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const isOk = response.status >= 200 && response.status < 300;
            if (!isOk) {
                console.error(response.error);
                setError(response.error);
                handleErrorResponseToastBootstrap.show();
                return;
            }

            console.log(response);
            setUserId(response.data.user_id);
            setButtonDisabled(true);
            handleSuccessResponseToastBootstrap.show();
        } catch (error) {
            setButtonDisabled(true);
            console.error(error);
            setError(error.response.data.error);
            handleErrorResponseToastBootstrap.show();
        }
    };

    return (
        <div className="p-3">
            <form onSubmit={handleSubmit}>
                <h2>Register</h2>
                <div className="p-1">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="p-1">
                    <label htmlFor="first_name">First Name</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        className="form-control"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="p-1">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        className="form-control"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="p-1">
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="p-1">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="p-1">
                    <label htmlFor="confirm_password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        className="form-control"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3 p-1">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isButtonDisabled}
                    >
                        Register
                    </button>
                </div>
                <div className="toast-container position-fixed top-0 start-50 translate-middle-x">
                    <div
                        id="handleErrorResponseToast"
                        className="toast"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="toast-header">
                            <strong className="me-auto text-danger">
                                ERROR
                            </strong>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="toast"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="toast-body">{error}</div>
                    </div>
                </div>
                <div className="toast-container position-fixed top-0 start-50 translate-middle-x">
                    <div
                        id="handleSuccessResponseToast"
                        className="toast"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="toast-header">
                            <strong className="me-auto text-success">
                                SUCCESS
                            </strong>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="toast"
                                aria-label="Close"
                                onClick={() => {
                                    setButtonDisabled(false);
                                    navigate("/login");
                                }}
                            ></button>
                        </div>
                        <div className="toast-body">Account created!</div>
                    </div>
                </div>
            </form>
            <div className="p-1">
                Already have an account? <Link to="/login">Login here!</Link>
            </div>
        </div>
    );
}

export default Register;
