import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000";

export default function AboutPage() {
  const [data, setData] = useState({ title: "", body: "" });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/content/about/`).then((res) => {
      setData(res.data);
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{data.title}</h2>
      <p className="whitespace-pre-line text-sm">{data.body}</p>
    </div>
  );
}
