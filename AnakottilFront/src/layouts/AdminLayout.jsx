// src/layouts/AdminLayout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const mobile = localStorage.getItem("mobile") || "admin";
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("mobile");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/admin-dashboard" && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Anakottil Temple – Admin</h1>
          <p className="text-xs text-slate-200">Logged in as {mobile}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
        >
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white shadow-md min-h-screen p-4 space-y-2">
          <p className="text-[11px] uppercase text-slate-500 mb-1">
            Admin Menu
          </p>

          <Link
            to="/admin-dashboard/bookings"
            className={`block px-3 py-2 rounded text-sm ${
              isActive("/admin-dashboard/bookings")
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Manage Bookings
          </Link>

          <Link
            to="/admin-dashboard/donations"
            className={`block px-3 py-2 rounded text-sm ${
              isActive("/admin-dashboard/donations")
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Manage Donations
          </Link>

          <Link
            to="/admin-dashboard/content"
            className={`block px-3 py-2 rounded text-sm ${
              isActive("/admin-dashboard/content")
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Edit Content
          </Link>
          <Link
            to="/admin-dashboard/gallery"
            className={`block px-3 py-2 rounded text-sm ${
              isActive("/admin-dashboard/gallery")
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Manage Gallery
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white shadow-md rounded-xl p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
