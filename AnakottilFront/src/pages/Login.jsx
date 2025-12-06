import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
        mobile,
        password,
      });

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("mobile", res.data.user.mobile);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/user-dashboard";
      }
    } catch (err) {
      setError("Invalid mobile or password.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md space-y-4 w-80"
      >
        <h2 className="text-xl font-semibold text-center">Login</h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="text-sm">Mobile</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
