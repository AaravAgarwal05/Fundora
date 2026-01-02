// components/ProjectFilters.jsx
import { useState } from "react";

export default function ProjectFilters({ projects, setFiltered }) {
  const [search, setSearch] = useState("");

  function applyFilters(text) {
    setSearch(text);

    const filtered = projects.filter((p) =>
      p.title.toLowerCase().includes(text.toLowerCase()) ||
      p.short.toLowerCase().includes(text.toLowerCase())
    );

    setFiltered(filtered);
  }

  return (
    <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
      <input
        value={search}
        onChange={(e) => applyFilters(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 border border-slate-700 
                   text-slate-200 placeholder-slate-400"
        placeholder="Search projects..."
      />
    </div>
  );
}
