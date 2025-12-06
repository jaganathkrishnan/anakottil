import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

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
  const index = ((days % NAKSHATRAS.length) + NAKSHATRAS.length) % NAKSHATRAS.length;
  return NAKSHATRAS[index];
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatMonth(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [malayalamStar, setMalayalamStar] = useState("");
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: "",
    pooja_type: "archana",
    time_slot: "",
    notes: "",
  });

  const token = localStorage.getItem("authToken");

  // Load bookings for current month
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/bookings/?month=${formatMonth(currentMonth)}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setBookings(res.data);
      } catch (e) {
        console.log("Error loading bookings", e);
      }
    };
    if (token) fetchBookings();
  }, [currentMonth, token]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setMalayalamStar(getMalayalamStar(date));
  };

  const handleMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  const handleInput = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateStr = formatDate(selectedDate);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/bookings/`,
        {
          name: formData.name,
          pooja_type: formData.pooja_type,
          time_slot: formData.time_slot,
          notes: formData.notes,
          date: dateStr,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      alert("Booking successful! (pending)");
      setBookings((prev) => [...prev, res.data]);
      setSelectedDate(null);
      setMalayalamStar("");
      setFormData({
        name: "",
        pooja_type: "archana",
        time_slot: "",
        notes: "",
      });
    } catch (e) {
      console.log(e);
      alert("Booking failed.");
    }
  };

  // Block booking if any non-cancelled booking exists on that day
  const isBooked = selectedDate
    ? bookings.some(
        (b) =>
          b.date === formatDate(selectedDate) &&
          b.status !== "cancelled"
      )
    : false;

  // Tailwind-only indicator: red dot for confirmed, orange for pending-only
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = formatDate(date);

    const bookingsForDay = bookings.filter((b) => b.date === dateStr);
    const activeBookings = bookingsForDay.filter(
      (b) => b.status !== "cancelled"
    );
    if (activeBookings.length === 0) return null;

    const hasConfirmed = activeBookings.some((b) => b.status === "confirmed");
    const dotClass = hasConfirmed ? "text-red-500" : "text-orange-500";

    return (
      <span className={`block text-center text-[10px] mt-0.5 ${dotClass}`}>
        ●
      </span>
    );
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-semibold mb-1">📅 Pooja Booking</h2>
      <p className="text-xs text-gray-500 mb-4">
        <span className="text-red-500 font-semibold">●</span> confirmed,
        <span className="text-orange-500 font-semibold ml-1">●</span> pending.
        Cancelled slots are free again.
      </p>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Calendar */}
        <div className="shadow-md rounded-lg p-2 bg-white">
          <Calendar
            onClickDay={handleDateChange}
            onActiveStartDateChange={handleMonthChange}
            minDate={new Date()}
            tileContent={tileContent}
          />
        </div>

        {/* Form */}
        <div className="w-full max-w-sm">
          {!selectedDate && (
            <p className="text-gray-500 text-sm">
              Select a date on the calendar to book a pooja.
            </p>
          )}

          {selectedDate && !isBooked && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Date:</span>{" "}
                {selectedDate.toDateString()}
                <br />
                <span className="font-medium">Nakshatra:</span>{" "}
                {malayalamStar}
              </p>

              <div>
                <label className="block mb-1 text-sm font-medium">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Pooja Type
                </label>
                <select
                  name="pooja_type"
                  value={formData.pooja_type}
                  onChange={handleInput}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {POOJA_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Time Slot (optional)
                </label>
                <input
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleInput}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 7:00 AM"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInput}
                  rows={2}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded text-sm font-medium"
              >
                Book Pooja
              </button>
            </form>
          )}

          {selectedDate && isBooked && (
            <p className="text-red-600 text-sm font-semibold mt-2">
              ❌ Slot already booked on {selectedDate.toDateString()} (pending or confirmed).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
