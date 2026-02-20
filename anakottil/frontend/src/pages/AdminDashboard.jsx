// src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

function AdminDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [monthStr, setMonthStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const mobile = localStorage.getItem("mobile");
  const role = localStorage.getItem("role");

  // 🔒 Protect route properly
  useEffect(() => {
    if (role !== "admin") {
      navigate("/user-dashboard");
    }
  }, [role, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `/api/bookings/?month=${monthStr}`
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
    fetchBookings();
  }, [monthStr]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);

      await axios.patch(
        `/api/bookings/${bookingId}/`,
        { status: newStatus }
      );

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: newStatus }
            : b
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
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Admin Dashboard
          </h1>
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

      <main className="max-w-6xl mx-auto mt-6 bg-white shadow-sm rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold">
              Pooja Bookings
            </h2>
            <p className="text-xs text-slate-500">
              Manage bookings by month.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={monthStr}
              onChange={(e) =>
                setMonthStr(e.target.value)
              }
              className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={fetchBookings}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">
            Loading bookings...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bookings found for this month.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left">
                    Mobile
                  </th>
                  <th className="px-3 py-2 text-left">
                    Pooja
                  </th>
                  <th className="px-3 py-2 text-left">
                    Time
                  </th>
                  <th className="px-3 py-2 text-left">
                    Notes
                  </th>
                  <th className="px-3 py-2 text-left">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left">
                    Change
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      {b.date}
                    </td>
                    <td className="px-3 py-2">
                      {b.name}
                    </td>
                    <td className="px-3 py-2">
                      {b.mobile}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {b.pooja_type}
                    </td>
                    <td className="px-3 py-2">
                      {b.time_slot || "-"}
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      {b.notes || "-"}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {b.status}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) =>
                          handleStatusChange(
                            b.id,
                            e.target.value
                          )
                        }
                        className="border border-slate-200 px-2 py-1 rounded text-xs"
                      >
                        <option value="pending">
                          pending
                        </option>
                        <option value="confirmed">
                          confirmed
                        </option>
                        <option value="cancelled">
                          cancelled
                        </option>
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