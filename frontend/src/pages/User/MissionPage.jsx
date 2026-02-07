import axios from "axios";
import { useEffect, useState } from "react";

import API_BASE_URL from "@/apiConfig";


export default function MissionPage() {
  const [data, setData] = useState({ title: "", body: "" });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/content/mission/`).then((res) => {
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
