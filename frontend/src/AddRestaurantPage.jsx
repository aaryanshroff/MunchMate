import RestaurantTypesSelector from './RestaurantTypesSelector.jsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

function AddRestaurantPage() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: ''
    });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // TODO @dyasin: Use the error state handler
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value
        });
    };

    const isValidZipCode = (zip_code) => {
        const VALID_ZIP_CODE_REGEX = /^\d{5}$|^\d{5}-\d{4}$/;
        return zip_code.test(VALID_ZIP_CODE_REGEX);
    };
    const isValidPhone = (phone) => {
        // TODO @dyasin: write the regex for valid US phones
        const VALID_PHONE_REGEX = /^\d{5}$|^\d{5}-\d{4}$/;
        return phone.test(VALID_PHONE_REGEX);
    };

    const isValidInput = () => {
        
        let isValid = Object.values(formData).every(value => value.trim() !== '');

        isValid = isValid && isValidZipCode( formData['zip_code'] ) && isValidPhone( formData['phone'] );

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // TODO @dyasin: finish this submission functionality
        // as well as adding user feedback on failure/success
        if ( !isValidInput() ) return;

        try {
            const response = await axios.get("/api/restaurants/add", {
                // TODO @dyasin: make this compatible with backend
                params: {
                    name: formData.name,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip_code,
                    phone: formData.phone,
                    types: selectedTypes.join(","),
                },
            });

            const isOk = response.status >= 200 && response.status < 300;
            if (!isOk) {
                console.log("got error:" + response.error);
                return;
            }
        } catch (error) {
            console.log("got error:" + response.error);
        }
    };

    return (
        <div>
            <h2>Add A Restaurant</h2>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
            </div>
            <div>
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
            </div>
            <div>
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
            </div>
        // TODO @dyasin: Make the state a drop down from a list to enforce valid state choice
            <div>
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
            </div>
            <div>
                <label htmlFor="zip_code">Zip Code:</label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  required
                />
            </div>
            <div>
                <label htmlFor="phone">Phone:</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
            </div>
            <RestaurantTypesSelector selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} error={error} setError={setError} />
            <button type="button" className='btn btn-secondary' onClick={handleSubmit}>
                Add Restaurant
            </button>
        </div>
    );
}

export default AddRestaurantPage;
