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

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/bookings/?month=${formatMonth(currentMonth)}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setBookings(res.data);
      } catch (e) {
        console.log("Error loading bookings");
      }
    };
    fetchBookings();
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

      alert("Booking successful!");
      setBookings((prev) => [...prev, res.data]);
      setSelectedDate(null);
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

  const isBooked = selectedDate
    ? bookings.some((b) => b.date === formatDate(selectedDate))
    : false;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-5">📅 Pooja Booking</h2>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Calendar */}
        <Calendar
          onClickDay={handleDateChange}
          onActiveStartDateChange={handleMonthChange}
          minDate={new Date()}
          className="shadow-md rounded-lg p-2 bg-white"
        />

        {/* Form */}
        <div className="w-full max-w-sm">
          {!selectedDate && (
            <p className="text-gray-500 text-center">Select a date to book</p>
          )}

          {selectedDate && !isBooked && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-700">
                <strong>Date:</strong> {selectedDate.toDateString()} <br />
                <strong>Nakshatra:</strong> {malayalamStar}
              </p>

              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Pooja Type</label>
                <select
                  name="pooja_type"
                  value={formData.pooja_type}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                >
                  {POOJA_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Time Slot (optional)</label>
                <input
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInput}
                  rows={2}
                  className="w-full border px-3 py-2 rounded"
                ></textarea>
              </div>

              <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
                Book Pooja
              </button>
            </form>
          )}

          {selectedDate && isBooked && (
            <p className="text-red-600 font-semibold">
              ❌ Already booked for {selectedDate.toDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
