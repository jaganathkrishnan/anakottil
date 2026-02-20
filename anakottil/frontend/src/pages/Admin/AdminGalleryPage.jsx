// src/pages/Admin/AdminGalleryPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axiosInstance";

export default function AdminGalleryPage() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const role = localStorage.getItem("role");

  // 🔒 Protect route
  useEffect(() => {
    if (role !== "admin") {
      navigate("/user-dashboard");
    }
  }, [role, navigate]);

  // ------------ LOAD GALLERY ------------
  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/gallery/");
      setImages(res.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // ------------ FILE INPUT ------------
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  // ------------ UPLOAD IMAGE ------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose an image first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const res = await axios.post(
        "/api/gallery/",
        formData
      );

      // Optimistic update
      setImages((prev) => [res.data, ...prev]);

      setFile(null);
      setCaption("");

    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ------------ DELETE IMAGE ------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      setDeletingId(id);

      await axios.delete(`/api/gallery/${id}/`);

      // Optimistic remove
      setImages((prev) =>
        prev.filter((img) => img.id !== id)
      );

    } catch (err) {
      console.error(err);
      alert("Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Manage Gallery
        </h2>

        <button
          onClick={fetchGallery}
          className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {/* Upload Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm"
            />
            {file && (
              <p className="mt-1 text-[11px] text-slate-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-60"
          >
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        {loading ? (
          <p className="text-sm text-slate-500">
            Loading images...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : images.length === 0 ? (
          <p className="text-sm text-slate-500">
            No images in gallery yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={img.image}
                    alt={
                      img.caption ||
                      "Gallery image"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {img.caption && (
                      <p className="text-[11px] mb-1">
                        {img.caption}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      {new Date(
                        img.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    disabled={
                      deletingId === img.id
                    }
                    onClick={() =>
                      handleDelete(img.id)
                    }
                    className="mt-3 text-[11px] px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-slate-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}