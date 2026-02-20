// src/pages/DonationsPage.jsx

import { useEffect, useState } from "react";
import axios from "@/axiosInstance";

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
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // ---------------- FETCH USER DONATIONS ----------------
  const fetchDonations = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await axios.get("/api/donations/");
      setDonations(res.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load donations.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------- SUBMIT DONATION ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/donations/", {
        ...form,
        amount: parseFloat(form.amount || "0"),
      });

      // Optimistic update (no full refetch)
      setDonations((prev) => [res.data, ...prev]);

      setForm({
        name: "",
        mobile: "",
        amount: "",
        payment_reference: "",
        message: "",
      });

      alert(
        "Thank you! Your donation has been recorded as pending."
      );

    } catch (err) {
      console.error(err);
      alert("Failed to submit donation.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadgeClass = (is_verified) =>
    is_verified
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-8">

      {/* ---------------- DONATION INFO ---------------- */}
      <div className="border border-slate-200 rounded-xl p-6 bg-white">
        <h2 className="text-xl font-semibold mb-3">
          🙏 Donations
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          Devotees may donate using the bank details or UPI QR below.
          After sending your donation, submit your details so the
          temple can verify and acknowledge your offering.
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Bank Details */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-semibold mb-3">
              Bank Transfer Details
            </h3>

            <div className="text-sm space-y-2">
              <p><strong>Account Name:</strong> Anakottil Temple Trust</p>
              <p><strong>Account Number:</strong> 123456789012</p>
              <p><strong>Bank:</strong> State Bank of India</p>
              <p><strong>Branch:</strong> Pattanakkad</p>
              <p><strong>IFSC:</strong> SBIN0000000</p>
            </div>
          </div>

          {/* QR */}
          <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center bg-slate-50">
            <h3 className="text-sm font-semibold mb-3">
              UPI / QR Code
            </h3>

            <div className="w-40 h-40 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-white overflow-hidden">
              <img
                src="/qr-donation.png"
                alt="Donation QR"
                className="max-w-full max-h-full"
                onError={(e) =>
                  (e.currentTarget.style.display = "none")
                }
              />
            </div>

            <p className="mt-3 text-xs text-slate-600 text-center">
              Scan using any UPI app.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- DONATION FORM ---------------- */}
      <div className="border border-slate-200 rounded-xl p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">
          I Have Donated
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4 text-sm"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="border px-3 py-2 rounded"
          />

          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Mobile (optional)"
            className="border px-3 py-2 rounded"
          />

          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount (₹)"
            required
            className="border px-3 py-2 rounded"
          />

          <input
            name="payment_reference"
            value={form.payment_reference}
            onChange={handleChange}
            placeholder="UPI Reference / Transaction ID"
            required
            className="border px-3 py-2 rounded"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message (optional)"
            rows={2}
            className="md:col-span-2 border px-3 py-2 rounded"
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* ---------------- USER DONATIONS ---------------- */}
      <div className="border border-slate-200 rounded-xl p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">
          Your Donations
        </h3>

        {fetching ? (
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left">
                    Amount (₹)
                  </th>
                  <th className="px-3 py-2 text-left">
                    Reference
                  </th>
                  <th className="px-3 py-2 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {donations.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      {new Date(
                        d.created_at
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      ₹{d.amount}
                    </td>
                    <td className="px-3 py-2">
                      {d.payment_reference}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${statusBadgeClass(
                          d.is_verified
                        )}`}
                      >
                        {d.is_verified
                          ? "verified"
                          : "pending"}
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