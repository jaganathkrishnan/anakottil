    import { useEffect, useState } from "react";
import axios from "axios";

import API_BASE_URL from "@/apiConfig";

axios.post(`${API_BASE_URL}/api/auth/login/`, data)

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/gallery/`);
      setImages(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Temple Gallery</h2>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-slate-500">
          No photos have been added to the gallery yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={`${API_BASE_URL}${img.image}`}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                />
              </div>
              {img.caption && (
                <div className="px-2 py-1 text-[11px] text-slate-700">
                  {img.caption}
                </div>
              )}
              <div className="px-2 pb-1 text-[10px] text-slate-400">
                {new Date(img.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
