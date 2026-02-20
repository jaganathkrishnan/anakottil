// src/pages/GalleryPage.jsx

import { useEffect, useState } from "react";
import axios from "@/axiosInstance";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Temple Gallery
      </h2>

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
          No photos have been added yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={img.image}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {img.caption && (
                <div className="px-3 py-2 text-xs text-slate-700">
                  {img.caption}
                </div>
              )}

              <div className="px-3 pb-3 text-[10px] text-slate-400">
                {new Date(img.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}