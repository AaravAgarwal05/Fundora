// pages/index.js
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProjectCard from "../components/ProjectCard";
import FiltersSidebar from "../components/FiltersSidebar";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Sidebar toggle
  const [showFilters, setShowFilters] = useState(false);

  // 🔹 Filters (unchanged logic)
  const [filters, setFilters] = useState({
    categories: [],
    minGoal: "",
    maxGoal: "",
    sort: "recent",
  });

  // 🔹 Search (main search stays)
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  async function loadProjects() {
    setLoading(true);

    let q = supabase.from("projects").select("*");

    // SORT
    switch (filters.sort) {
      case "trending":
        q = q.order("pledged", { ascending: false });
        break;
      case "funded":
        q = q.order("goal", { ascending: false });
        break;
      case "ending":
        q = q.order("deadline", { ascending: true });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }

    // CATEGORY FILTER
    if (filters.categories.length > 0) {
      q = q.contains("categories", filters.categories);
    }

    // GOAL RANGE
    if (filters.minGoal) q = q.gte("goal", filters.minGoal);
    if (filters.maxGoal) q = q.lte("goal", filters.maxGoal);

    const { data } = await q;
    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, [filters]);

  // SEARCH SUGGESTIONS (unchanged)
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
const router = useRouter();

const handleStartProject = async () => {
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    router.push("/login?redirect=/create");
  } else {
    router.push("/create");
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleFilters={() => setShowFilters(true)} />
        

      <main className="flex-1 w-full px-6 relative">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              Explore projects
            </h1>
          </div>

          <button
  onClick={handleStartProject}
  className="btn-primary"
>
  Start a project
</button>

        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <input
            className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg z-20">
              {suggestions.map((s) => (
                <a
                  key={s.id}
                  href={`/projects/${s.id}`}
                  className="block px-4 py-2 hover:bg-slate-800 text-white border-b border-slate-800"
                >
                  <div className="font-semibold text-blue-300">
                    {s.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {s.short}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* 🔹 BACKDROP (NEW — REQUIRED) */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* 🔹 OVERLAY SIDEBAR (UNCHANGED) */}
        {showFilters && (
          <FiltersSidebar
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
