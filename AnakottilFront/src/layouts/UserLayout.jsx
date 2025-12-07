// src/layouts/UserLayout.jsx
import { Link, Outlet } from "react-router-dom";

export default function UserLayout() {
  const mobile = localStorage.getItem("mobile");

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("mobile");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navbar */}
      <header className="bg-slate-800 text-white px-6 py-4 flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Anakottil Temple – Devotee Portal</h1>
          <p className="text-xs text-slate-200">Welcome, {mobile}</p>
        </div>
        <button
          className="text-xs bg-slate-600 px-3 py-1 rounded hover:bg-slate-500"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white shadow-md min-h-screen p-4 space-y-3">
          <Link className="block p-2 rounded hover:bg-slate-200" to="/user-dashboard/about">
            About Us
          </Link>
          <Link className="block p-2 rounded hover:bg-slate-200" to="/user-dashboard/mission">
            Mission & Purpose
          </Link>
          <Link className="block p-2 rounded hover:bg-slate-200" to="/user-dashboard/booking">
            Pooja Booking
          </Link>
          <Link className="block p-2 rounded hover:bg-slate-200" to="/user-dashboard/donations">
            Donations
          </Link>
          <Link className="block p-2 rounded hover:bg-slate-200" to="/user-dashboard/gallery">
            Temple Gallery
          </Link>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white shadow-md rounded-xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
