// src/pages/Admin/AdminBookingsPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

export default function AdminBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  // 🔒 Protect route
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
        `/api/bookings/?month=${month}`
      );

      setBookings(res.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [month]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      await axios.patch(
        `/api/bookings/${id}/`,
        { status }
      );

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status } : b
        )
      );

    } catch (err) {
      console.error(err);
      alert("Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "confirmed")
      return "bg-green-100 text-green-700";
    if (status === "cancelled")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  // 🔍 Combined filtering
  const filteredBookings = bookings.filter((b) => {
    const matchMobile = searchMobile.trim()
      ? b.mobile?.includes(searchMobile.trim())
      : true;

    const matchName = searchName.trim()
      ? b.name
          ?.toLowerCase()
          .includes(searchName.trim().toLowerCase())
      : true;

    return matchMobile && matchName;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          Manage Bookings
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Month filter */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-400"
          />

          {/* Mobile search */}
          <input
            type="text"
            placeholder="Search mobile…"
            value={searchMobile}
            onChange={(e) =>
              setSearchMobile(e.target.value)
            }
            className="border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-400"
          />

          {/* Name search */}
          <input
            type="text"
            placeholder="Search name…"
            value={searchName}
            onChange={(e) =>
              setSearchName(e.target.value)
            }
            className="border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-400"
          />
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
      ) : filteredBookings.length === 0 ? (
        <p className="text-sm text-slate-500">
          No bookings match your filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-xs">
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
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((b) => (
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
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${statusBadgeClass(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        disabled={
                          updatingId === b.id
                        }
                        onClick={() =>
                          updateStatus(
                            b.id,
                            "confirmed"
                          )
                        }
                        className="text-[11px] px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Confirm
                      </button>

                      <button
                        disabled={
                          updatingId === b.id
                        }
                        onClick={() =>
                          updateStatus(
                            b.id,
                            "cancelled"
                          )
                        }
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