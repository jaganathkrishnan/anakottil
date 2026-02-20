// src/pages/Admin/AdminDonations.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

export default function AdminDonations() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
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

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/donations/");
      setDonations(res.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const toggleVerify = async (id, currentStatus) => {
    try {
      setUpdatingId(id);

      await axios.patch(
        `/api/donations/${id}/`,
        { is_verified: !currentStatus }
      );

      // Optimistic update
      setDonations((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, is_verified: !currentStatus }
            : d
        )
      );

    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between">
        <h1 className="text-xl font-semibold">
          Admin – Donations
        </h1>

        <button
          onClick={fetchDonations}
          className="text-xs bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-600"
        >
          Refresh
        </button>
      </header>

      <main className="max-w-6xl mx-auto mt-6 bg-white shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Donations List
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : donations.length === 0 ? (
          <p className="text-sm text-slate-500">
            No donations submitted yet.
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
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left">
                    Ref / Txn ID
                  </th>
                  <th className="px-3 py-2 text-left">
                    Message
                  </th>
                  <th className="px-3 py-2 text-left">
                    Verified
                  </th>
                  <th className="px-3 py-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {donations.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      {new Date(
                        d.created_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-3 py-2">
                      {d.name}
                    </td>

                    <td className="px-3 py-2">
                      {d.mobile}
                    </td>

                    <td className="px-3 py-2">
                      ₹{d.amount}
                    </td>

                    <td className="px-3 py-2">
                      {d.payment_reference}
                    </td>

                    <td className="px-3 py-2 max-w-xs">
                      {d.message || "-"}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          d.is_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {d.is_verified
                          ? "verified"
                          : "pending"}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <button
                        disabled={
                          updatingId === d.id
                        }
                        onClick={() =>
                          toggleVerify(
                            d.id,
                            d.is_verified
                          )
                        }
                        className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:bg-slate-400"
                      >
                        {d.is_verified
                          ? "Mark Pending"
                          : "Verify"}
                      </button>
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