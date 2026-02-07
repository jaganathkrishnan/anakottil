// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard"; // simple redirect component
import GalleryPage from "./pages/User/GalleryPage";
import AdminGalleryPage from "./pages/Admin/AdminGalleryPage";

// User layout + pages
import UserLayout from "./layouts/UserLayout";
import AboutPage from "./pages/User/AboutPage";
import MissionPage from "./pages/User/MissionPage";
import BookingPage from "./pages/User/BookingPage";
import DonationsPage from "./pages/User/DonationsPage";

// Admin layout + pages
import AdminLayout from "./layouts/AdminLayout";
import AdminBookingsPage from "./pages/Admin/AdminBookingsPage";
import AdminDonationsPage from "./pages/Admin/AdminDonationsPage";
import AdminContentPage from "./pages/Admin/AdminContentPage";

function App() {
  return (
    <Routes>
      {/* Root → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Old user dashboard path → redirect */}
      <Route path="/dashboard" element={<UserDashboard />} />

      {/* USER DASHBOARD (devotee) */}
      <Route path="/user-dashboard" element={<UserLayout />}>
        <Route index element={<AboutPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="gallery" element={<GalleryPage />} /> 
      </Route>

      {/* ADMIN DASHBOARD */}
      <Route path="/admin-dashboard" element={<AdminLayout />}>
        {/* default → bookings */}
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="donations" element={<AdminDonationsPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
