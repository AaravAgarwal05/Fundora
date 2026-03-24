import { useState } from "react";

export default function CampaignAIGenerator({ setDescription }) {

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCampaign() {
    try {
      setLoading(true);

      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          goal,
        }),
      });

      const data = await res.json();

      console.log("AI Response:", data); // ⭐ DEBUG

      if (!data?.content) {
        alert("AI failed to generate campaign");
        return;
      }

      // ⭐ THIS IS THE IMPORTANT PART
      setDescription(data.content);

    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">

      <h3 className="text-white font-semibold">
        🤖 AI Campaign Generator
      </h3>

      <input
        className="input"
        placeholder="Campaign Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        className="input"
        placeholder="Funding Goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <button
        onClick={generateCampaign}
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate AI Campaign"}
      </button>

    </div>
  );
}
