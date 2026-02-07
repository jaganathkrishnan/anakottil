import { useEffect, useState } from "react";
import axios from "axios";

import API_BASE_URL from "@/apiConfig";


export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    amount: "",
    payment_reference: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/donations/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setDonations(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (token) fetchDonations();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/donations/`,
        {
          ...form,
          amount: parseFloat(form.amount || "0"),
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      alert("Thank you! Your donation has been recorded as pending.");
      setForm({
        name: "",
        mobile: "",
        amount: "",
        payment_reference: "",
        message: "",
      });
      fetchDonations();
    } catch (e) {
      console.log(e);
      alert("Failed to submit donation info.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = (is_verified) =>
    is_verified
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-6">
      {/* Info + bank/QR */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <h2 className="text-xl font-semibold mb-2">🙏 Donations</h2>
        <p className="text-sm text-slate-600 mb-3">
          Devotees who wish to support Anakottil Temple can make offerings
          using the bank details or UPI QR code below. After sending your
          donation, you may submit the details so the temple can acknowledge
          your offering.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Bank details */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Bank Transfer Details
            </h3>
            <dl className="text-sm text-slate-700 space-y-1">
              <div className="flex justify-between">
                <dt className="font-medium">Account Name</dt>
                <dd>Anakottil Temple Trust</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Account Number</dt>
                <dd>123456789012</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Bank</dt>
                <dd>State Bank of India</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Branch</dt>
                <dd>Pattanakkad</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">IFSC Code</dt>
                <dd>SBIN0000000</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-slate-500">
              * Replace with the actual temple bank details.
            </p>
          </div>

          {/* QR */}
          <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 relative">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              UPI / QR Code
            </h3>
            <div className="w-40 h-40 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-white overflow-hidden relative">
              <img
                src="/qr-donation.png"
                alt="Donation QR"
                className="max-w-full max-h-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs text-slate-400 absolute">
                QR image here
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 text-center">
              Scan this QR code using your UPI app to donate.
            </p>
          </div>
        </div>
      </div>

      {/* User form */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-semibold mb-3">I have donated</h3>
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4 text-sm"
        >
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mobile (optional)</label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Amount (₹)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              UPI Reference / Transaction ID
            </label>
            <input
              name="payment_reference"
              value={form.payment_reference}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">
              Message / Purpose (optional)
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit donation details"}
            </button>
          </div>
        </form>
      </div>

      {/* User's own donations list */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <h3 className="text-lg font-semibold mb-3">Your Donations</h3>
        {donations.length === 0 ? (
          <p className="text-sm text-slate-500">
            You have not submitted any donations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Amount (₹)</th>
                  <th className="px-2 py-1 border">Ref / Txn ID</th>
                  <th className="px-2 py-1 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-2 py-1 border">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1 border">{d.amount}</td>
                    <td className="px-2 py-1 border">{d.payment_reference}</td>
                    <td className="px-2 py-1 border">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          statusBadgeClass(d.is_verified)
                        }`}
                      >
                        {d.is_verified ? "verified" : "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
