import RestaurantTypesSelector from "./RestaurantTypesSelector.jsx";
import { useState } from "react";
import axios from "axios";

// TODO @dyasin: The toasts need a second to load in, so immediately pressing submit won't show errors.
// This bug really doesn't matter but can be fixed by disabling submit until the toast divs are found using useEffect
function AddRestaurantPage() {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        state: "AL",
        zip_code: "",
        phone: "",
        image1: "",
        image2: "",
        image3: "",
    });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [error, setError] = useState("");

    const STATE_ACRONYMS = [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const isValidZipCode = (zip_code) => {
        const VALID_ZIP_CODE_REGEX = /^\d{5}$|^\d{5}-\d{4}$/;
        return VALID_ZIP_CODE_REGEX.test(zip_code);
    };
    const isValidPhone = (phone) => {
        const VALID_PHONE_REGEX =
            /^(?:\+1\s?)?(\(\d{3}\)|\d{3})([-\s]?)\d{3}[-\s]?\d{4}$/;
        return VALID_PHONE_REGEX.test(phone);
    };

    const isValidInput = () => {
        const isAllFormDataFilledOut = Object.entries(formData).every(
            ([key, value]) => {
                console.log(key + " " + value);

                return key.startsWith("image") || value.trim() !== "";
            }
        );

        if (!isAllFormDataFilledOut) {
            setError("Please fill out the entire form");
            return false;
        }

        if (!isValidZipCode(formData["zip_code"])) {
            setError("Invalid zip code");
            return false;
        }

        if (!isValidPhone(formData["phone"])) {
            setError("Invalid phone number");
            return false;
        }

        return true;
    };

    // Gives success/error feedback to the user after they try and add a restaurant
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
            // Creates a commma separated string where empty strings are ignored.
            const imagesStr = (
                formData.image1 +
                "," +
                formData.image2 +
                "," +
                formData.image3
            )
                .split(",")
                .filter((image) => image.trim() !== "");

            response = await axios.get("/api/restaurants/add", {
                params: {
                    name: formData.name,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip_code,
                    phone: formData.phone,
                    types: selectedTypes.join(","),
                    images: imagesStr.join(","),
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
                name: "",
                address: "",
                city: "",
                state: "AL",
                zip_code: "",
                phone: "",
                image1: "",
                image2: "",
                image3: "",
            });
        } catch (error) {
            console.error(response.error);
            setError(error);
            handleErrorResponseToastBootstrap.show();
        }
    };

    return (
        <form className="p-3">
            <h2>Add A Restaurant</h2>
            <div className="p-1">
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="p-1">
                <label htmlFor="address">Address</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="p-1">
                <label htmlFor="city">City</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="input-group mb-3 p-1">
                <label className="input-group-text" htmlFor="state">
                    State
                </label>
                <select
                    className="form-select"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                >
                    {STATE_ACRONYMS.map((state, index) => (
                        <option key={index} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
            </div>
            <div className="p-1">
                <label htmlFor="zip_code">Zip Code</label>
                <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    className="form-control"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="p-1">
                <label htmlFor="phone">Phone Number</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3 p-1">
                <RestaurantTypesSelector
                    selectedTypes={selectedTypes}
                    setSelectedTypes={setSelectedTypes}
                    error={error}
                    setError={setError}
                />
            </div>
            <div className="p-1">
                <label htmlFor="image1">
                    Optionally upload up to 3 image URLs
                </label>
                <input
                    type="text"
                    id="image1"
                    name="image1"
                    className="form-control"
                    placeholder="Image 1"
                    value={formData.image1}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    id="image2"
                    name="image2"
                    className="form-control"
                    placeholder="Image 2"
                    value={formData.image2}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    id="image3"
                    name="image3"
                    className="form-control"
                    placeholder="Image 3"
                    value={formData.image3}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3 p-1">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                >
                    Add Restaurant
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
                        <strong className="me-auto text-danger">ERROR</strong>
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
                        ></button>
                    </div>
                    <div className="toast-body">Restaurant added!</div>
                </div>
            </div>
        </form>
    );
}

export default AddRestaurantPage;
