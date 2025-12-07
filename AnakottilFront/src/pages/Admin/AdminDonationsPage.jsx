// src/pages/Admin/AdminDonationsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");

  const token = localStorage.getItem("authToken");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/donations/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setDonations(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDonations();
  }, [token]);

  const toggleVerify = async (id, current) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/donations/${id}/`,
        { is_verified: !current },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchDonations();
    } catch (e) {
      console.log(e);
      alert("Failed to update status.");
    }
  };

  // 🔍 Combined filtering: mobile + name
  const filteredDonations = donations.filter((d) => {
    const matchMobile = searchMobile.trim()
      ? d.mobile?.toString().includes(searchMobile.trim())
      : true;

    const matchName = searchName.trim()
      ? d.name?.toLowerCase().includes(searchName.trim().toLowerCase())
      : true;

    return matchMobile && matchName;
  });

  return (
    <div className="space-y-4">
      {/* Top bar: title + filters + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Manage Donations</h2>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Mobile search */}
          <div className="flex items-center gap-1">
            <label className="font-medium text-slate-600">Mobile:</label>
            <input
              type="text"
              placeholder="Search mobile…"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Name search */}
          <div className="flex items-center gap-1">
            <label className="font-medium text-slate-600">Name:</label>
            <input
              type="text"
              placeholder="Search name…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchDonations}
            className="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading donations...</p>
      ) : filteredDonations.length === 0 ? (
        <p className="text-sm text-slate-500">
          No donations match your filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Mobile</th>
                <th className="px-2 py-1 border">Amount</th>
                <th className="px-2 py-1 border">Ref / Txn ID</th>
                <th className="px-2 py-1 border">Message</th>
                <th className="px-2 py-1 border">Verified</th>
                <th className="px-2 py-1 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-2 py-1 border">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-1 border">{d.name}</td>
                  <td className="px-2 py-1 border">{d.mobile}</td>
                  <td className="px-2 py-1 border">{d.amount}</td>
                  <td className="px-2 py-1 border">{d.payment_reference}</td>
                  <td className="px-2 py-1 border max-w-xs">
                    {d.message || "-"}
                  </td>
                  <td className="px-2 py-1 border">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        d.is_verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {d.is_verified ? "verified" : "pending"}
                    </span>
                  </td>
                  <td className="px-2 py-1 border">
                    <button
                      onClick={() => toggleVerify(d.id, d.is_verified)}
                      className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-900"
                    >
                      {d.is_verified ? "Mark Pending" : "Verify"}
                    </button>
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
