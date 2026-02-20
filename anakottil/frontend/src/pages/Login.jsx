// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login/", {
        mobile,
        password,
      });

      // Save auth
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("mobile", res.data.user.mobile);
      localStorage.setItem("role", res.data.user.role);

      // Redirect properly
      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }

    } catch (err) {
      setError("Invalid mobile or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-xl shadow-sm space-y-5 w-80"
      >
        <h2 className="text-xl font-semibold text-center">
          Temple Login
        </h2>

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <div>
          <label className="text-sm text-slate-600">
            Mobile
          </label>
          <input
            type="text"
            className="w-full border border-slate-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-slate-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}