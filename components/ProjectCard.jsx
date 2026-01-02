import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isSaved, toggleSave, getSaveCounts } from "../lib/saved";
import { supabase } from "../lib/supabaseClient";

export default function ProjectCard({ project }) {
  const router = useRouter();
  if (!project) return null;

  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [creator, setCreator] = useState(null);
  const [user, setUser] = useState(null);

  /* ---------------- CURRENT USER ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- SAVE STATE ---------------- */
  useEffect(() => {
    if (!project?.id) return;
    const counts = getSaveCounts();
    setSaveCount(counts[project.id] || 0);
    setSaved(isSaved(project.id));
  }, [project?.id]);

  function handleSave(e) {
    e.stopPropagation();
    setSaved(toggleSave(project.id));
  }

  /* ---------------- LOAD CREATOR ---------------- */
  useEffect(() => {
    if (!project?.owner_id) return;

    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", project.owner_id)
      .single()
      .then(({ data }) => setCreator(data));
  }, [project?.owner_id]);

  /* ---------------- BADGES ---------------- */
  const now = new Date();
  const createdAt = project.created_at ? new Date(project.created_at) : null;
  const deadline = project.deadline ? new Date(project.deadline) : null;

  const daysSinceCreated = createdAt
    ? Math.floor((now - createdAt) / 86400000)
    : null;

  const daysUntilDeadline = deadline
    ? Math.ceil((deadline - now) / 86400000)
    : null;

  const fundedPercent = project.goal
    ? Math.round(((project.pledged || 0) / project.goal) * 100)
    : 0;

  const badges = [];
  if (daysSinceCreated !== null && daysSinceCreated <= 7)
    badges.push({ label: "NEW", class: "bg-green-600" });

  if (fundedPercent >= 40)
    badges.push({ label: "TRENDING", class: "bg-pink-600" });

  if (daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline >= 0)
    badges.push({ label: "ENDING SOON", class: "bg-yellow-600" });

  const thumbnail = project.thumbnail || null;

  const isOwner = user?.id === project.owner_id;

  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="cursor-pointer bg-slate-900/80 border border-slate-800 rounded-xl
                 shadow hover:shadow-xl hover:-translate-y-1 transition p-4 relative"
    >
      {/* SAVE */}
      <button
        onClick={handleSave}
        className="absolute top-3 right-3 text-white/80 hover:text-white text-xl z-10"
      >
        {saved ? "🔖" : "📑"}
      </button>

      {/* BADGES */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
        {badges.map((b, i) => (
          <span
            key={i}
            className={`${b.class} text-white text-[10px] px-2 py-[2px] rounded-full`}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* THUMBNAIL */}
      <div className="h-40 rounded-lg mb-3 overflow-hidden border border-slate-800 bg-slate-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
            No thumbnail
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-100 hover:text-blue-400 transition">
        {project.title}
      </h3>

      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
        {project.short}
      </p>

      <p className="text-xs text-slate-300 mt-3">
        {fundedPercent}% funded — ₹{project.pledged || 0}
      </p>

      <p className="text-[11px] text-slate-500 mt-1">
        ❤️ {saveCount} people saved this
      </p>

      {/* CREATOR */}
      {creator && (
        <div
          className="mt-4 pt-3 border-t border-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/creator/${creator.id}`);
          }}
        >
          <p className="text-sm text-slate-300 mb-2">
            By: {creator.full_name}
          </p>

          <button className="w-full text-center px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600 transition">
            View Profile
          </button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/projects/${project.id}`);
          }}
          className="flex-1 text-xs bg-slate-700 text-white py-1.5 rounded"
        >
          View
        </button>

        {/* ✅ FUND BUTTON ONLY IF NOT CREATOR */}
        {!isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/projects/${project.id}/fund`);
            }}
            className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded"
          >
            Fund
          </button>
        )}
      </div>
    </div>
  );
}
