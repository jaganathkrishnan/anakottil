// src/pages/Admin/AdminGalleryPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

import API_BASE_URL from "@/apiConfig";

axios.post(`${API_BASE_URL}/api/auth/login/`, data)

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("authToken");

  // ------------ LOAD GALLERY ------------
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/gallery/`);
      setImages(res.data);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // ------------ FILE INPUT ------------
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // ------------ UPLOAD IMAGE ------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose an image file first.");
      return;
    }

    if (!token) {
      alert("No auth token found. Please log in again as admin.");
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
        `${API_BASE_URL}/api/gallery/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            // axios sets correct multipart boundary automatically
          },
        }
      );

      console.log("Upload success:", res.data);
      alert("Image uploaded.");

      setFile(null);
      setCaption("");
      fetchGallery();
    } catch (err) {
      console.error("Upload error:", err);
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data || {});
      if (status === 403) {
        alert(
          "Not allowed (403). Make sure this user is admin (is_staff=True).\n\n" +
            detail
        );
      } else if (status === 400) {
        alert("Bad request (400):\n\n" + detail);
      } else {
        alert("Failed to upload image.\n\n" + detail);
      }
    } finally {
      setUploading(false);
    }
  };

  // ------------ DELETE IMAGE ------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/gallery/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete image.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Manage Gallery
        </h2>
        <button
          onClick={fetchGallery}
          className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {/* Upload card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-slate-800">
              Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="
                block w-full text-sm text-slate-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                cursor-pointer
              "
            />
            {file && (
              <p className="mt-1 text-[11px] text-slate-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-800">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-slate-300 bg-white text-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>

      {/* Gallery grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading images...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-slate-500">No images in gallery yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${img.image}`}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div>
                    {img.caption && (
                      <p className="text-[11px] text-slate-800 mb-1">
                        {img.caption}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      {new Date(img.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
