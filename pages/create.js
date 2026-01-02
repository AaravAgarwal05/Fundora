// pages/create.js
import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MediaUploader from "../components/MediaUploader";
import CategorySelector from "../components/CategorySelector";
import { supabase } from "../lib/supabaseClient";
import { uploadFileToProject } from "../lib/storage";

/* ---------------- CATEGORY NORMALIZER ---------------- */
const CATEGORY_MAP = {
  "AI & ML": "artifical_intelligence",
  "Artificial Intelligence": "artifical_intelligence",
  "Technology": "technology",
  "Food": "food",
  "Education": "education",
  "Health": "health",
  "Environment": "environment",
  "Art": "art",
  "Art & Design": "art",
};

function normalizeCategories(selected = []) {
  return selected
    .map((c) => CATEGORY_MAP[c] || c)
    .filter(Boolean);
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [short, setShort] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [prototypeUrl, setPrototypeUrl] = useState("");

  const [categories, setCategories] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [team, setTeam] = useState([{ name: "", role: "" }]);

  function addTeamMember() {
    setTeam((t) => [...t, { name: "", role: "" }]);
  }

  function removeTeamMember(idx) {
    setTeam((t) => t.filter((_, i) => i !== idx));
  }

  function updateTeamMember(idx, key, value) {
    setTeam((t) =>
      t.map((m, i) => (i === idx ? { ...m, [key]: value } : m))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return alert("Please login first");

      if (!thumbnailFile) return alert("Please upload a thumbnail image");

      /* ✅ NORMALIZE CATEGORIES HERE */
      const normalizedCategories = normalizeCategories(categories);

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title,
          short,
          description,
          goal: Number(goal),
          pledged: 0,
          deadline,
          prototypeUrl: prototypeUrl || null,
          owner_id: user.id,
          categories: normalizedCategories,
        })
        .select()
        .single();

      if (error || !project) {
        console.error(error);
        return alert("Failed to create project");
      }

      const uploadedThumb = await uploadFileToProject(
        thumbnailFile,
        project.id,
        "thumbnail"
      );

      if (uploadedThumb?.url) {
        await supabase
          .from("projects")
          .update({ thumbnail: uploadedThumb.url })
          .eq("id", project.id);
      }

      const mediaRows = [];
      for (const file of files) {
        const uploaded = await uploadFileToProject(file, project.id);
        if (!uploaded?.url) continue;

        mediaRows.push({
          project_id: project.id,
          url: uploaded.url,
          type: file.type.startsWith("image")
            ? "image"
            : file.type.startsWith("video")
            ? "video"
            : "document",
        });
      }

      if (mediaRows.length > 0) {
        await supabase.from("media").insert(mediaRows);
      }

      const validTeam = team.filter((t) => t.name.trim() !== "");
      if (validTeam.length > 0) {
        await supabase.from("team_members").insert(
          validTeam.map((t) => ({
            project_id: project.id,
            name: t.name,
            role: t.role,
          }))
        );
      }

      alert("Project created successfully!");
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-white">Create Project</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800">
          <input className="input" placeholder="Project Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Short Description" required value={short} onChange={(e) => setShort(e.target.value)} />
          <textarea className="input h-32" placeholder="Full Description" required value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <input className="input" type="number" placeholder="Goal ₹" required value={goal} onChange={(e) => setGoal(e.target.value)} />
            <input className="input" type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          <input className="input" placeholder="Prototype URL (optional)" value={prototypeUrl} onChange={(e) => setPrototypeUrl(e.target.value)} />

          <CategorySelector selected={categories} setSelected={setCategories} />

          {/* PROJECT THUMBNAIL */}
<div className="space-y-2">
  <p className="text-sm font-semibold text-slate-200">
    Project Thumbnail
  </p>

  <label className="block cursor-pointer bg-slate-800 border border-slate-700 rounded-lg p-4 text-white hover:bg-slate-700 transition">
    Select thumbnail image
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnailFile(file);
      }}
    />
  </label>

  {thumbnailFile && (
    <div className="mt-2">
      <p className="text-xs text-slate-400 mb-1">Selected thumbnail:</p>
      <img
        src={URL.createObjectURL(thumbnailFile)}
        className="max-w-xs rounded border"
        alt="Thumbnail preview"
      />
    </div>
  )}
</div>


          <MediaUploader mediaFiles={files} setMediaFiles={setFiles} />

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
