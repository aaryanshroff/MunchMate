import RestaurantTypesSelector from "./RestaurantTypesSelector.jsx";

import { useState, useEffect } from "react";
import axios from "axios";

function Restaurants() {
    // TODO: Different error and isLoading state for restaurants vs types
    const [searchTerm, setSearchTerm] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // types fetched and set in RestaurantTypeSelector component
    // const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                setIsLoading(true);

                const response = await axios.get("/api/restaurants", {
                    params: {
                        q: searchTerm,
                        types: selectedTypes.join(","),
                        city: selectedCity,
                    },
                });

                const isOk = response.status >= 200 && response.status < 300;
                if (!isOk) {
                    // `error` field defined by the backend
                    setError(response.error);
                    return;
                }

                const { data } = response.data;
                setRestaurants(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRestaurants();
    }, [searchTerm, selectedTypes, selectedCity]);

    // TODO: @aaryanshroff loading spinner inside of dropdown menu for cities and types
    useEffect(() => {
        async function fetchCities() {
            try {
                const response = await axios.get("/api/cities");

                const isOk = response.status >= 200 && response.status < 300;
                if (!isOk) {
                    // `error` field defined by the backend
                    setError(response.error);
                    return;
                }

                // I expect
                // response.data = {
                //     "data": [
                //         "Toronto",
                //         "San Francisco"
                //     ]
                // }
                const { data } = response.data;
                setCities(data);
            } catch (error) {
                setError(error.message);
            }
        }

        fetchCities();
    }, []);

    return (
        <div className="container">
            <form className="my-4">
                <div className="input-group input-group-lg">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search Restaurants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </form>

            <div className="d-flex">
                <div className="dropdown px-2">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                    >
                        Select city
                    </button>
                    <ul className="dropdown-menu">
                        <li className="d-grid d-flex mx-2 p-1 gap-2">
                            <input
                                className="form-check-input"
                                type="radio"
                                value=""
                                checked={selectedCity == ""}
                                onChange={(e) => setSelectedCity("")}
                            />
                            <label className="form-check-label">All</label>
                        </li>
                        {cities.length > 0 ? (
                            cities.map((city) => (
                                <li
                                    key={city}
                                    className="d-grid d-flex mx-2 p-1 gap-2"
                                >
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        value={city}
                                        checked={selectedCity == city}
                                        onChange={(e) =>
                                            setSelectedCity(e.target.value)
                                        }
                                    />
                                    <label className="form-check-label">
                                        {city}
                                    </label>
                                </li>
                            ))
                        ) : (
                            <li>Loading...</li>
                        )}
                    </ul>
                </div>

                <RestaurantTypesSelector
                    selectedTypes={selectedTypes}
                    setSelectedTypes={setSelectedTypes}
                    error={error}
                    setError={setError}
                    className="px-2"
                />
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col" className="p-3">
                                Name
                            </th>
                            <th scope="col" className="p-3">
                                Phone
                            </th>
                            <th scope="col" className="p-3">
                                Address
                            </th>
                            <th scope="col" className="p-3">
                                City
                            </th>
                            <th scope="col" className="p-3">
                                State
                            </th>
                            <th scope="col" className="p-3">
                                Zip Code
                            </th>
                            <th scope="col" className="p-3">
                                Type
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {restaurants.map((restaurant, index) => (
                            <tr
                                key={restaurant.restaurant_id || index}
                                className="border-bottom"
                            >
                                <th
                                    scope="row"
                                    className="font-weight-bold text-nowrap p-3"
                                >
                                    {restaurant.name}
                                </th>
                                <td className="p-3">{restaurant.phone}</td>
                                <td className="p-3">{restaurant.address}</td>
                                <td className="p-3">{restaurant.city}</td>
                                <td className="p-3">{restaurant.state}</td>
                                <td className="p-3">{restaurant.zip_code}</td>
                                <td className="p-3">{restaurant.types}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Restaurants;
