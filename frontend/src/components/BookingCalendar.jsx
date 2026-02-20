// src/components/BookingCalendar.jsx

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "@/axiosInstance";

const NAKSHATRAS = [
  "Ashwathi","Bharani","Karthika","Rohini","Makayiram","Thiruvathira",
  "Punartham","Pooyam","Ayilyam","Makam","Pooram","Uthram","Atham",
  "Chithira","Chothi","Vishakham","Anizham","Thrikketta","Moolam",
  "Pooradam","Uthradam","Thiruvonam","Avittam","Chathayam","Pururuttathi",
  "Uthruttathi","Revathi"
];

const POOJA_TYPES = [
  { value: "archana", label: "Archana" },
  { value: "abhishekam", label: "Abhishekam" },
  { value: "special", label: "Special Pooja" },
];

function getMalayalamStar(date) {
  const baseDate = new Date("2020-01-01");
  const days = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
  const index =
    ((days % NAKSHATRAS.length) + NAKSHATRAS.length) %
    NAKSHATRAS.length;
  return NAKSHATRAS[index];
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [malayalamStar, setMalayalamStar] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    pooja_type: "archana",
    time_slot: "",
    notes: "",
  });

  // 🔥 Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/bookings/");
        setBookings(res.data);
      } catch (err) {
        console.log("Error loading bookings", err);
      }
    };

    fetchBookings();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setMalayalamStar(getMalayalamStar(date));
  };

  const handleInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateStr = formatDate(selectedDate);

    try {
      setLoading(true);

      const res = await axios.post("/api/bookings/", {
        name: formData.name,
        pooja_type: formData.pooja_type,
        time_slot: formData.time_slot,
        notes: formData.notes,
        date: dateStr,
      });

      setBookings((prev) => [...prev, res.data]);

      alert("Booking successful! (pending)");

      setSelectedDate(null);
      setMalayalamStar("");
      setFormData({
        name: "",
        pooja_type: "archana",
        time_slot: "",
        notes: "",
      });

    } catch (err) {
      console.log(err);
      alert("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserCancel = async (bookingId) => {
    const confirmDelete = window.confirm(
      "Cancel this booking? Allowed only if pending."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/bookings/${bookingId}/`);

      setBookings((prev) =>
        prev.filter((b) => b.id !== bookingId)
      );
    } catch (err) {
      console.log(err);
      alert("Failed to cancel booking.");
    }
  };

  const isBooked = selectedDate
    ? bookings.some(
        (b) =>
          b.date === formatDate(selectedDate) &&
          b.status !== "cancelled"
      )
    : false;

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatDate(date);
    const bookingsForDay = bookings.filter(
      (b) => b.date === dateStr && b.status !== "cancelled"
    );

    if (bookingsForDay.length === 0) return null;

    const hasConfirmed = bookingsForDay.some(
      (b) => b.status === "confirmed"
    );

    return (
      <span
        className={`block text-center text-[10px] mt-0.5 ${
          hasConfirmed ? "text-red-500" : "text-orange-500"
        }`}
      >
        ●
      </span>
    );
  };

  const todayStr = formatDate(new Date());

  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.status !== "cancelled" &&
        b.date >= todayStr
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const historyBookings = bookings
    .filter(
      (b) =>
        b.status === "cancelled" ||
        b.date < todayStr
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const statusBadgeClass = (status) => {
    if (status === "confirmed")
      return "bg-green-100 text-green-700";
    if (status === "cancelled")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-8">
      {/* Booking Section */}
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-2">
          📅 Pooja Booking
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="shadow-sm rounded-lg p-2 bg-white">
            <Calendar
              onClickDay={handleDateChange}
              minDate={new Date()}
              tileContent={tileContent}
            />
          </div>

          <div className="w-full max-w-sm">
            {!selectedDate && (
              <p className="text-sm text-gray-500">
                Select a date to book.
              </p>
            )}

            {selectedDate && !isBooked && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong>{" "}
                  {selectedDate.toDateString()}
                  <br />
                  <strong>Nakshatra:</strong>{" "}
                  {malayalamStar}
                </p>

                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInput}
                  required
                  className="w-full border border-gray-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />

                <select
                  name="pooja_type"
                  value={formData.pooja_type}
                  onChange={handleInput}
                  className="w-full border border-gray-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                >
                  {POOJA_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <input
                  name="time_slot"
                  placeholder="Time Slot (optional)"
                  value={formData.time_slot}
                  onChange={handleInput}
                  className="w-full border border-gray-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />

                <textarea
                  name="notes"
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={handleInput}
                  rows={2}
                  className="w-full border border-gray-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? "Booking..." : "Book Pooja"}
                </button>
              </form>
            )}

            {selectedDate && isBooked && (
              <p className="text-red-600 text-sm mt-2">
                ❌ Slot already booked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3">
          Upcoming Bookings
        </h3>

        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-gray-500">
            No upcoming bookings.
          </p>
        ) : (
          upcomingBookings.map((b) => (
            <div
              key={b.id}
              className="border-b border-slate-100 py-2 flex justify-between items-center"
            >
              <div className="text-sm">
                {b.date} – {b.pooja_type}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>

                {b.status === "pending" && (
                  <button
                    onClick={() =>
                      handleUserCancel(b.id)
                    }
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* History */}
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3">
          Booking History
        </h3>

        {historyBookings.length === 0 ? (
          <p className="text-sm text-gray-500">
            No history yet.
          </p>
        ) : (
          historyBookings.map((b) => (
            <div
              key={b.id}
              className="border-b border-slate-100 py-2 flex justify-between"
            >
              <div className="text-sm">
                {b.date} – {b.pooja_type}
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(
                  b.status
                )}`}
              >
                {b.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}