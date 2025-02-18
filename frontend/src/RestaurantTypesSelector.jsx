import { useState, useEffect } from 'react';
import axios from 'axios';

const RestaurantTypesSelector = ({ selectedTypes, setSelectedTypes, error, setError }) => {
    const [types, setTypes] = useState([]);

    useEffect(() => {
        async function fetchTypes() {
            try {
                const response = await axios.get("/api/types");

                const isOk = response.status >= 200 && response.status < 300;
                if (!isOk) {
                    // `error` field defined by the backend
                    setError(response.error);
                    return;
                }

                const { data } = response.data;
                console.log(data);
                setTypes(data);
            } catch (error) {
                setError(error.message);
            } finally {
            }
        }

        fetchTypes();
    }, []);

    return (
        <div className="dropdown">
            <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
            >
                Filter by cuisine
            </button>
            <ul className="dropdown-menu">
                {types.length > 0 ? (
                    types.map((type) => (
                        <li
                            key={type.type_id}
                            className="d-grid d-flex mx-2 p-1 gap-2"
                        >
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={type.type_id}
                                checked={selectedTypes.includes(
                                    type.type_id
                                )}
                                onChange={(e) => {
                                    const typeId = Number(e.target.value);
                                    if (e.target.checked) {
                                        setSelectedTypes([
                                            ...selectedTypes,
                                            typeId,
                                        ]);
                                    } else {
                                        setSelectedTypes(
                                            selectedTypes.filter(
                                                (id) => id !== typeId
                                            )
                                        );
                                    }
                                }}
                            />
                            <label className="form-check-label">
                                {type.type_name}
                            </label>
                        </li>
                    ))
                ) : (
                    <li>Loading...</li>
                )}
            </ul>
        </div>
    );
}

export default RestaurantTypesSelector;
