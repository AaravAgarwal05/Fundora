import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function FollowersPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("followers");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user) return;
    loadConnections();
  }, [user, tab]);

  async function loadConnections() {
    setLoading(true);

    // 1️⃣ Get follower IDs
    const { data: followRows, error } = await supabase
      .from("followers")
      .select(tab === "followers" ? "follower_id" : "following_id")
      .eq(
        tab === "followers" ? "following_id" : "follower_id",
        user.id
      );

    if (error || !followRows || followRows.length === 0) {
      setList([]);
      setLoading(false);
      return;
    }

    // 2️⃣ Extract profile IDs
    const ids = followRows.map((r) =>
      tab === "followers" ? r.follower_id : r.following_id
    );

    // 3️⃣ Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", ids);

    setList(profiles || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Connections
        </h1>

        {/* TABS */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setTab("followers")}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === "followers"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Followers
          </button>

          <button
            onClick={() => setTab("following")}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === "following"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Following
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-center text-slate-400">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-center text-slate-400">No users found.</p>
        ) : (
          <div className="space-y-4">
            {list.map((p) => (
              <Link
                key={p.id}
                href={`/creator/${p.id}`}
                className="flex items-center gap-4 bg-slate-800/70 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition"
              >
                <img
                  src={
                    p.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      p.full_name || "User"
                    )}&background=0D8ABC&color=fff`
                  }
                  className="w-12 h-12 rounded-full border border-slate-600"
                />
                <span className="text-white font-medium">
                  {p.full_name || "Unnamed User"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
