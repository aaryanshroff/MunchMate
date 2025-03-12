import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import Layout from "./Layout.jsx";
import Restaurants from "./Restaurants.jsx";
import RestaurantPage from "./RestaurantPage.jsx";
import AddRestaurantPage from "./AddRestaurantPage.jsx";
import Profile from "./UserProfile.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import UserSearchPage from "./UserSearchPage.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            {/* https://reactrouter.com/start/library/routing */}
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Restaurants />} />
                    <Route
                        path="/add-restaurant"
                        element={<AddRestaurantPage />}
                    />
                    <Route
                        path="restaurant/:restaurant_id"
                        element={<RestaurantPage />}
                    />
                    <Route path="profile/:uid" element={<Profile />} />
                    <Route path="register" element={<Register />} />
                    <Route path="login" element={<Login />} />
                    <Route path="users/search" element={<UserSearchPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
