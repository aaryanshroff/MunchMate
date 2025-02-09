import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";

import Restaurants from './Restaurants.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Restaurants />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
