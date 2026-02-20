// src/pages/AboutPage.jsx

import { useEffect, useState } from "react";
import axios from "@/axiosInstance";

export default function AboutPage() {
  const [data, setData] = useState({
    title: "",
    body: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "/api/content/about/"
        );

        setData(res.data);

      } catch (err) {
        console.error(err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {data.title}
      </h2>

      <p className="whitespace-pre-line text-sm text-slate-700">
        {data.body}
      </p>
    </div>
  );
}