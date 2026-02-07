import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between">
        <h1 className="text-xl font-semibold">Admin – Donations</h1>
        <button
          onClick={fetchDonations}
          className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
        >
          Refresh
        </button>
      </header>

      <main className="max-w-5xl mx-auto mt-6 bg-white shadow-md rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Donations List</h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : donations.length === 0 ? (
          <p className="text-sm text-slate-500">No donations submitted yet.</p>
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
                {donations.map((d) => (
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
      </main>
    </div>
  );
}
