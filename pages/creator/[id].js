// pages/creator/[id].js
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabaseClient";
import ProjectCard from "../../components/ProjectCard";

import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

function cleanUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
}

export default function CreatorProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const followTouchedRef = useRef(false);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (id && currentUserId !== undefined) {
      loadProfile(id);
    }
  }, [id, currentUserId]);

  /* ---------------- LOAD PROFILE ---------------- */
  async function loadProfile(userId) {
    setLoading(true);

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const { data: projectRows } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    const { count: followersCount } = await supabase
      .from("followers")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId);

    const { count: followingCount } = await supabase
      .from("followers")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (currentUserId && !followTouchedRef.current) {
      const { data } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    }

    setProfile({
      ...profileRow,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
    });

    setProjects(projectRows || []);
    setLoading(false);
  }

  /* ---------------- FOLLOW ---------------- */
  async function followUser(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) return router.push("/login");
    if (currentUserId === id) return;

    followTouchedRef.current = true;

    setIsFollowing(true);
    setProfile((p) => ({
      ...p,
      followers_count: p.followers_count + 1,
    }));

    const { error } = await supabase.from("followers").insert({
      follower_id: currentUserId,
      following_id: id,
    });

    if (error) {
      followTouchedRef.current = false;
      setIsFollowing(false);
      setProfile((p) => ({
        ...p,
        followers_count: Math.max(0, p.followers_count - 1),
      }));
    }
  }

  /* ---------------- UNFOLLOW ---------------- */
  async function unfollowUser(e) {
    e.preventDefault();
    e.stopPropagation();

    followTouchedRef.current = true;

    setIsFollowing(false);
    setProfile((p) => ({
      ...p,
      followers_count: Math.max(0, p.followers_count - 1),
    }));

    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", id);

    if (error) {
      followTouchedRef.current = false;
      setIsFollowing(true);
      setProfile((p) => ({
        ...p,
        followers_count: p.followers_count + 1,
      }));
    }
  }

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Profile not found.
      </div>
    );
  }

  const avatar =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.full_name || "User"
    )}&background=0D8ABC&color=fff&size=256`;

  const banner =
    profile.banner_url ||
    "https://images.unsplash.com/photo-1503264116251-35a269479413";

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      {/* Banner */}
      <div
        className="w-full h-56 relative"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-6 -mt-20 relative">
        <div className="flex gap-6 items-center">
          <img
            src={avatar}
            className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold text-white">
              {profile.full_name}
            </h1>

            {/* 🔥 PROFILE ACTIONS */}
{currentUserId === profile.id ? (
  /* OWN PROFILE */
  <div className="flex gap-3 mt-2">
    <button
      onClick={() => router.push("/edit-profile")}
      className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
    >
      Edit Profile
    </button>
  </div>
) : currentUserId ? (
  /* OTHER USER PROFILE */
  <div className="flex gap-3 mt-2">
    <button
      onClick={() => router.push(`/dm/${profile.id}`)}
      className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600"
    >
      Message
    </button>

    {isFollowing ? (
      <button
        onClick={unfollowUser}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
      >
        Unfollow
      </button>
    ) : (
      <button
        onClick={followUser}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm"
      >
        Follow
      </button>
    )}
  </div>
) : null}


            <p className="text-slate-300 text-sm mt-3">{profile.bio}</p>

            <div className="flex gap-4 text-2xl text-slate-300 mt-3">
              {profile.twitter && <a href={cleanUrl(profile.twitter)} target="_blank"><FaTwitter /></a>}
              {profile.linkedin && <a href={cleanUrl(profile.linkedin)} target="_blank"><FaLinkedin /></a>}
              {profile.github && <a href={cleanUrl(profile.github)} target="_blank"><FaGithub /></a>}
              {profile.instagram && <a href={cleanUrl(profile.instagram)} target="_blank"><FaInstagram /></a>}
              {profile.youtube && <a href={cleanUrl(profile.youtube)} target="_blank"><FaYoutube /></a>}
              {profile.website && <a href={cleanUrl(profile.website)} target="_blank"><FaGlobe /></a>}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-10 flex gap-12 text-center">
          <div>
            <p className="text-white text-xl font-semibold">{projects.length}</p>
            <p className="text-slate-400 text-sm">Projects</p>
          </div>
          <div>
            <p className="text-white text-xl font-semibold">{profile.followers_count}</p>
            <p className="text-slate-400 text-sm">Followers</p>
          </div>
          <div>
            <p className="text-white text-xl font-semibold">{profile.following_count}</p>
            <p className="text-slate-400 text-sm">Following</p>
          </div>
        </div>

        <h2 className="text-xl text-white mt-10 mb-4">Projects</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
