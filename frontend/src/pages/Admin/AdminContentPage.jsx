// src/pages/Admin/AdminContentPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

import API_BASE_URL from "@/apiConfig";

axios.post(`${API_BASE_URL}/api/auth/login/`, data)

export default function AdminContentPage() {
  const [activeKey, setActiveKey] = useState("about"); // "about" or "mission"
  const [form, setForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("authToken");

  const loadContent = async (key) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/content/${key}/`);
      setForm({
        title: res.data.title || "",
        body: res.data.body || "",
      });
    } catch (e) {
      console.log(e);
      alert("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(activeKey);
  }, [activeKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/content/${activeKey}/`,
        {
          title: form.title,
          body: form.body,
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      alert("Content saved.");
    } catch (e) {
      console.log(e);
      alert("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Edit Website Content</h2>

      {/* Toggle About / Mission */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveKey("about")}
          className={`px-3 py-1 rounded-full border ${
            activeKey === "about"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
          }`}
        >
          About
        </button>
        <button
          type="button"
          onClick={() => setActiveKey("mission")}
          className={`px-3 py-1 rounded-full border ${
            activeKey === "mission"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
          }`}
        >
          Mission & Purpose
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading content...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={8}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
