// components/FiltersSidebar.jsx
export default function FiltersSidebar({ filters, setFilters, onClose }) {
  const categories = [
    "Artificial Intelligence",
    "Technology",
    "Education",
    "Health",
    "Environment",
    "Food",
    "Art",
    "Fashion",
    "Gaming",
    "Community",
    "Business",
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-slate-900 z-50 p-6 shadow-2xl animate-slideIn">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* CATEGORIES */}
        <div className="mb-8">
          <h3 className="text-sm text-slate-300 font-semibold mb-3">
            Categories
          </h3>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = filters.categories.includes(c);
              return (
                <button
                  key={c}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      categories: active
                        ? f.categories.filter((x) => x !== c)
                        : [...f.categories, c],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-xs transition
                    ${
                      active
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* GOAL RANGE */}
        <div className="mb-8">
          <h3 className="text-sm text-slate-300 font-semibold mb-2">
            Goal Range (₹)
          </h3>
          <input
            type="number"
            placeholder="Min"
            className="w-full p-2 mb-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
            value={filters.minGoal}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minGoal: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full p-2 rounded bg-slate-800 text-slate-200 border border-slate-700"
            value={filters.maxGoal}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxGoal: e.target.value }))
            }
          />
        </div>

        {/* SORT */}
        <div>
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
      </aside>
    </>
  );
}
