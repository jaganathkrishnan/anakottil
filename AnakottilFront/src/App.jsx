// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard"; // redirect component
import UserLayout from "./layouts/UserLayout";
import AdminDonations from "./pages/AdminDonations";

import AboutPage from "./pages/User/AboutPage";
import MissionPage from "./pages/User/MissionPage";
import BookingPage from "./pages/User/BookingPage";
import DonationsPage from "./pages/User/DonationsPage";

import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* root -> login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      {/* old path redirect */}
      <Route path="/dashboard" element={<UserDashboard />} />

      {/* admin */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-donations" element={<AdminDonations />} />

      {/* user dashboard layout + nested pages */}
      <Route path="/user-dashboard" element={<UserLayout />}>
        <Route index element={<AboutPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="donations" element={<DonationsPage />} />
      </Route>

      {/* fallback for any unknown route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
