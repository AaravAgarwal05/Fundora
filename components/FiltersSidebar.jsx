//For Future
// components/FiltersSidebar.jsx
import { useState } from "react";

export default function FiltersSidebar({ filters, setFilters }) {
  const categories = [
    "Technology",
    "AI & ML",
    "Web & Apps",
    "Hardware",
    "Health",
    "Education",
    "Finance",
    "Environment",
    "Creative & Arts",
    "Gaming",
    "Social Impact",
    "Others",
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border border-slate-800 rounded-xl p-5 h-fit sticky top-24 hidden lg:block">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700 mb-4"
        value={filters.search}
        onChange={(e) =>
          setFilters((f) => ({ ...f, search: e.target.value }))
        }
      />

      {/* CATEGORIES */}
      <div className="mb-6">
        <h3 className="text-sm text-slate-300 font-semibold mb-2">
          Categories
        </h3>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
          {categories.map((c) => (
            <label
              key={c}
              className="flex items-center text-xs text-slate-400"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.categories.includes(c)}
                onChange={() => {
                  setFilters((f) => ({
                    ...f,
                    categories: f.categories.includes(c)
                      ? f.categories.filter((x) => x !== c)
                      : [...f.categories, c],
                  }));
                }}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* GOAL RANGE */}
      <div className="mb-6">
        <h3 className="text-sm text-slate-300 font-semibold mb-2">
          Goal Range (₹)
        </h3>
        <input
          type="number"
          placeholder="Min"
          className="w-full p-2 mb-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
          value={filters.minGoal}
          onChange={(e) =>
            setFilters((f) => ({ ...f, minGoal: Number(e.target.value) }))
          }
        />
        <input
          type="number"
          placeholder="Max"
          className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
          value={filters.maxGoal}
          onChange={(e) =>
            setFilters((f) => ({ ...f, maxGoal: Number(e.target.value) }))
          }
        />
      </div>

      {/* SORT */}
      <div className="mb-6">
        <h3 className="text-sm text-slate-300 font-semibold mb-2">
          Sort By
        </h3>
        <select
          className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sort: e.target.value }))
          }
        >
          <option value="recent">Recently Added</option>
          <option value="trending">Trending</option>
          <option value="funded">Most Funded</option>
          <option value="ending">Ending Soon</option>
        </select>
      </div>

      {/* TEAM SIZE */}
      <div className="mb-6">
        <h3 className="text-sm text-slate-300 font-semibold mb-2">
          Team Size
        </h3>

        <select
          className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
          value={filters.teamSize || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              teamSize: e.target.value || null,
            }))
          }
        >
          <option value="">Any</option>
          <option value="solo">Solo Founder</option>
          <option value="small">2–5 Members</option>
          <option value="large">6+ Members</option>
        </select>
      </div>

      {/* STATUS */}
      <div>
        <h3 className="text-sm text-slate-300 font-semibold mb-2">
          Project Status
        </h3>

        <select
          className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
          value={filters.status || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value || null,
            }))
          }
        >
          <option value="">Any</option>
          <option value="active">Active</option>
          <option value="ending">Ending Soon</option>
          <option value="closed">Closed</option>
          <option value="funded">Fully Funded</option>
        </select>
      </div>
    </aside>
  );
}
