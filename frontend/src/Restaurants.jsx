import axios from "axios";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router";
import RestaurantTypesSelector from "./RestaurantTypesSelector.jsx";

function Restaurants() {
    // TODO: Different error and isLoading state for restaurants vs types
    const [searchTerm, setSearchTerm] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [page, setPage] = useState(1);
    const [totalRestaurants, setTotalRestaurants] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // types fetched and set in RestaurantTypeSelector component
    // const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    async function fetchRestaurants(page) {
        try {
            const response = await axios.get("/api/restaurants", {
                params: {
                    q: searchTerm,
                    types: selectedTypes.join(","),
                    city: selectedCity,
                    page: page,
                },
            });

            const isOk = response.status >= 200 && response.status < 300;
            if (!isOk) {
                // `error` field defined by the backend
                console.error(error);
                return;
            }

            const { data, total } = response.data;
            setRestaurants((prevRestaurants) =>
                page === 1 ? data : [...prevRestaurants, ...data]
            );
            page === 1 && setTotalRestaurants(total);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRestaurants(1);
    }, [searchTerm, selectedTypes, selectedCity]);

    function handleLoadMoreRestaurants() {
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchRestaurants(nextPage);
            return nextPage;
        });
    }

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

            {/* {isLoading && <p>Loading...</p>} */}
            {error && <div className="alert alert-danger">{error}</div>}

            <InfiniteScroll
                dataLength={restaurants.length}
                next={handleLoadMoreRestaurants}
                hasMore={totalRestaurants > restaurants.length}
                loader={<p>Loading...</p>}
                endMessage={<p>No more restaurants to load.</p>}
            >
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col" className="p-3">
                                    Name
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
                                <th scope="col" className="p-3">
                                    Details
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {restaurants.map((restaurant, index) => (
                                <tr
                                    key={restaurant.restaurant_id}
                                    className="border-bottom"
                                >
                                    <td className=" p-3">{restaurant.name}</td>
                                    <td className="p-3">
                                        {restaurant.address}
                                    </td>
                                    <td className="p-3">{restaurant.city}</td>
                                    <td className="p-3">{restaurant.state}</td>
                                    <td className="p-3">
                                        {restaurant.zip_code}
                                    </td>
                                    <td
                                        className="p-3"
                                        style={{
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {restaurant.types}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                navigate(
                                                    `/restaurant/${restaurant.restaurant_id}`
                                                )
                                            }
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </InfiniteScroll>
        </div>
    );
}

export default Restaurants;
