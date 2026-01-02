// pages/index.js
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProjectCard from "../components/ProjectCard";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // ✅ SEARCH (WORKING VERSION)
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* =====================================================
     FILTERS — MUST MATCH Create Page + DB VALUES
     DB: categories TEXT[]
  ===================================================== */
  const FILTERS = [
    { key: "All", label: "All" },
    { key: "Trending", label: "Trending" },
    { key: "New", label: "New" },
    { key: "MostFunded", label: "Most Funded" },
    { key: "EndingSoon", label: "Ending Soon" },

    // Categories
    { key: "AI & ML", label: "AI & ML" },
    { key: "Technology", label: "Technology" },
    { key: "Food", label: "Food" },
    { key: "Education", label: "Education" },
    { key: "Health", label: "Health" },
    { key: "Environment", label: "Environment" },
    { key: "Art", label: "Art & Design" },
  ];

  /* =====================================================
     LOAD PROJECTS — FIXED & FINAL
  ===================================================== */
  async function loadProjects(filter) {
    setLoading(true);

    let q = supabase.from("projects").select("*");

    switch (filter) {
      case "Trending":
        q = q.order("pledged", { ascending: false });
        break;

      case "New":
        q = q.order("created_at", { ascending: false });
        break;

      case "MostFunded":
        q = q.order("goal", { ascending: false });
        break;

      case "EndingSoon":
        q = q.order("deadline", { ascending: true });
        break;

      case "All":
        q = q.order("created_at", { ascending: false });
        break;

      default:
        // ✅ CORRECT WAY FOR text[] CATEGORY FILTER
        q = q.contains("categories", [filter]);
    }

    const { data, error } = await q;

    if (!error) setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects(activeFilter);
  }, [activeFilter]);

  /* =====================================================
     SEARCH SUGGESTIONS — RESTORED (WORKING)
  ===================================================== */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, short")
        .ilike("title", `%${query}%`)
        .limit(5);

      setSuggestions(data || []);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Explore projects</h1>
          <a href="/create" className="btn-primary">Start a project</a>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <input
            className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* SEARCH SUGGESTIONS */}
          {query && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg z-20">
              {suggestions.map((s) => (
                <a
                  key={s.id}
                  href={`/projects/${s.id}`}
                  className="block px-4 py-2 hover:bg-slate-800 text-white border-b border-slate-800"
                >
                  <div className="font-semibold text-blue-300">{s.title}</div>
                  <div className="text-xs text-slate-400">{s.short}</div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs border ${
                activeFilter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* PROJECT GRID */}
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-slate-400">No projects found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
