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
  const [followingIds, setFollowingIds] = useState([]);

  /* 🔹 SEARCH STATE */
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  /* ---------------- AUTH (MISSING BEFORE) ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- LOAD FOLLOWING IDS ---------------- */
  useEffect(() => {
    if (!user) return;

    supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", user.id)
      .then(({ data }) => {
        setFollowingIds(data?.map((f) => f.following_id) || []);
      });
  }, [user]);

  /* ---------------- LOAD CONNECTIONS ---------------- */
  useEffect(() => {
    if (!user || search) return;
    loadConnections();
  }, [user, tab, search]);

  async function loadConnections() {
    setLoading(true);

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

    const ids = followRows.map((r) =>
      tab === "followers" ? r.follower_id : r.following_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", ids);

    setList(profiles || []);
    setLoading(false);
  }

  /* ---------------- 🔍 SEARCH USERS ---------------- */
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${search}%`)
        .limit(10);

      setSearchResults(data || []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- FOLLOW / UNFOLLOW (MISSING BEFORE) ---------------- */
  async function toggleFollow(targetId) {
    if (!user) return;

    const isFollowing = followingIds.includes(targetId);

    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);

      setFollowingIds((prev) =>
        prev.filter((id) => id !== targetId)
      );
    } else {
      await supabase.from("followers").insert({
        follower_id: user.id,
        following_id: targetId,
      });

      setFollowingIds((prev) => [...prev, targetId]);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Connections
        </h1>

        {/* TABS */}
        <div className="flex justify-center gap-4 mb-6">
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

        {/* SEARCH BAR */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search users by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                       text-white placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-cyan-500 transition"
          />
        </div>

        {/* SEARCH RESULTS */}
        {search && (
          <div className="space-y-4 mb-10">
            {searching && (
              <p className="text-center text-slate-400">Searching...</p>
            )}

            {!searching && searchResults.length === 0 && (
              <p className="text-center text-slate-400">
                No users found.
              </p>
            )}

            {searchResults.map((p) => (
              <Link
                key={p.id}
                href={`/creator/${p.id}`}
                className="flex items-center gap-4 bg-slate-800/70 border border-slate-700
                           rounded-lg p-4 hover:bg-slate-700 transition"
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

                <div className="flex-1">
                  <p className="text-white font-medium">
                    {p.full_name || "Unnamed User"}
                  </p>
                </div>

                {user?.id !== p.id && (
  <button
    onClick={(e) => {
      e.preventDefault();
      toggleFollow(p.id);
    }}
    className={`px-3 py-1 rounded text-xs ${
      followingIds.includes(p.id)
        ? "bg-slate-700 text-slate-300"
        : "bg-blue-600 text-white"
    }`}
  >
    {followingIds.includes(p.id)
      ? "Unfollow"
      : "+ Follow"}
  </button>
)}

              </Link>
            ))}
          </div>
        )}

        {/* ORIGINAL LIST */}
        {!search && (
          <>
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
                    className="flex items-center gap-4 bg-slate-800/70 border border-slate-700
                               rounded-lg p-4 hover:bg-slate-700 transition"
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
