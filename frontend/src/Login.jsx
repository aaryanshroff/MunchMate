import { useState, useEffect } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router";

function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [currentUserId, setCurrentUserId] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
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

        return true;
    };

    // Gives success/error feedback to the user after they try to log in
    const handleErrorResponseToast = document.getElementById(
        "handleErrorResponseToast"
    );
    const handleSuccessResponseToast = document.getElementById(
        "handleSuccessResponseToast"
    );

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
            response = await axios.post("/api/login", formData, {
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
            handleSuccessResponseToastBootstrap.show();

            // Reset the fields after submission
            setFormData({
                username: "",
                password: "",
            });
            console.log(response);
            setCurrentUserId(response.data.data["uid"]);
        } catch (error) {
            console.error(response.error);
            setError(error);
            handleErrorResponseToastBootstrap.show();
        }
    };

    return (
        <div className="p-3">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
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
                    <label htmlFor="password">Password</label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3 p-1">
                    <button type="submit" className="btn btn-primary">
                        Login
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
                                    if (currentUserId !== 0) {
                                        navigate(`/profile/${currentUserId}`);
                                    }
                                }}
                            ></button>
                        </div>
                        <div className="toast-body">Logged in!</div>
                    </div>
                </div>
            </form>
            <div className="p-1">
                Don't have an account?{" "}
                <Link to="/register">Register here!</Link>
            </div>
        </div>
    );
}

export default Login;
