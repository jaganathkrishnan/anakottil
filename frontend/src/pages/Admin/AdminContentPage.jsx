// src/pages/Admin/AdminContentPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

export default function AdminContentPage() {
  const navigate = useNavigate();

  const [activeKey, setActiveKey] = useState("about"); // "about" or "mission"
  const [form, setForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  // 🔒 Protect route
  useEffect(() => {
    if (role !== "admin") {
      navigate("/user-dashboard");
    }
  }, [role, navigate]);

  const loadContent = async (key) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `/api/content/${key}/`
      );

      setForm({
        title: res.data.title || "",
        body: res.data.body || "",
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(activeKey);
  }, [activeKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await axios.patch(
        `/api/content/${activeKey}/`,
        {
          title: form.title,
          body: form.body,
        }
      );

      alert("Content saved successfully.");

    } catch (err) {
      console.error(err);
      setError("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        Edit Website Content
      </h2>

      {/* Toggle */}
      <div className="flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveKey("about")}
          className={`px-4 py-1.5 rounded-full transition ${
            activeKey === "about"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          About
        </button>

        <button
          type="button"
          onClick={() => setActiveKey("mission")}
          className={`px-4 py-1.5 rounded-full transition ${
            activeKey === "mission"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Mission & Purpose
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading content...
        </p>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-4 text-sm"
        >
          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <div>
            <label className="block mb-1 font-medium">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Body
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={10}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium disabled:bg-blue-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}