import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";

import Layout from "./Layout.jsx";
import Restaurants from './Restaurants.jsx';
import AddRestaurantPage from "./AddRestaurantPage.jsx";
import Profile from "./UserProfile.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* https://reactrouter.com/start/library/routing */}
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Restaurants />} />
            <Route path="/add-restaurant" element={<AddRestaurantPage />} />
            <Route path="profile/:uid" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
