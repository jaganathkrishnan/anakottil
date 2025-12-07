// src/pages/Admin/AdminBookingsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/bookings/?month=${month}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setBookings(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token, month]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${id}/`,
        { status },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchBookings();
    } catch (e) {
      console.log(e);
      alert("Failed to update booking.");
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "confirmed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700"; // pending
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Manage Bookings</h2>
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="month" className="font-medium text-slate-600">
            Month:
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-500">
          No bookings found for this month.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Mobile</th>
                <th className="px-2 py-1 border">Pooja</th>
                <th className="px-2 py-1 border">Time</th>
                <th className="px-2 py-1 border">Notes</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-2 py-1 border">{b.date}</td>
                  <td className="px-2 py-1 border">{b.name}</td>
                  <td className="px-2 py-1 border">{b.mobile}</td>
                  <td className="px-2 py-1 border capitalize">
                    {b.pooja_type}
                  </td>
                  <td className="px-2 py-1 border">
                    {b.time_slot || "-"}
                  </td>
                  <td className="px-2 py-1 border max-w-xs">
                    {b.notes || "-"}
                  </td>
                  <td className="px-2 py-1 border">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${statusBadgeClass(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-2 py-1 border">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => updateStatus(b.id, "pending")}
                        className="text-[11px] px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "confirmed")}
                        className="text-[11px] px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
