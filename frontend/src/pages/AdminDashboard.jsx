// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/apiConfig";


function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [monthStr, setMonthStr] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
  });
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  const mobile = localStorage.getItem("mobile");
  const role = localStorage.getItem("role");

  // If not admin, push them out
  if (role !== "admin") {
    window.location.href = "/dashboard";
  }

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${API_BASE_URL}/api/bookings/?month=${monthStr}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("Not authorized. Please login as admin.");
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [monthStr, token]);

  const handleMonthChange = (e) => {
    setMonthStr(e.target.value); // value already in YYYY-MM
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${bookingId}/`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("mobile");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-xs text-slate-200">
            Logged in as {mobile} (admin)
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-slate-600 px-3 py-1 rounded-md hover:bg-slate-500"
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto mt-6 bg-white shadow-md rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Pooja Bookings</h2>
            <p className="text-xs text-slate-500">
              View and manage all devotee bookings for a selected month.
            </p>
          </div>

          {/* Month picker */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700">Month:</label>
            <input
              type="month"
              value={monthStr}
              onChange={handleMonthChange}
              className="border px-2 py-1 rounded text-sm"
            />
            <button
              onClick={fetchBookings}
              className="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-900"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading bookings...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bookings found for this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1 text-left">Mobile</th>
                  <th className="border px-2 py-1 text-left">Pooja Type</th>
                  <th className="border px-2 py-1 text-left">Time Slot</th>
                  <th className="border px-2 py-1 text-left">Notes</th>
                  <th className="border px-2 py-1 text-left">Status</th>
                  <th className="border px-2 py-1 text-left">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="border px-2 py-1">{b.date}</td>
                    <td className="border px-2 py-1">{b.name}</td>
                    <td className="border px-2 py-1">{b.mobile}</td>
                    <td className="border px-2 py-1">{b.pooja_type}</td>
                    <td className="border px-2 py-1">
                      {b.time_slot || "-"}
                    </td>
                    <td className="border px-2 py-1 max-w-xs">
                      {b.notes || "-"}
                    </td>
                    <td className="border px-2 py-1 capitalize">
                      {b.status}
                    </td>
                    <td className="border px-2 py-1">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleStatusChange(b.id, e.target.value)
                        }
                        disabled={updatingId === b.id}
                        className="border px-1 py-0.5 rounded text-xs"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
