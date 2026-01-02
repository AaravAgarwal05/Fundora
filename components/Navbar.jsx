import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { signOutUser } from "../lib/auth";
import { FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/router";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUser(u);

      if (u) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();

        setProfile(prof);
        loadUnread(u.id);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user || null;
        setUser(u);

        if (u) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", u.id)
            .single()
            .then((res) => setProfile(res.data));

          loadUnread(u.id);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  /* ---------------- UNREAD DM COUNT ---------------- */
  async function loadUnread(userId) {
    const { count } = await supabase
      .from("dm_messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", userId)
      .eq("read", false);

    setUnreadCount(count || 0);
  }

  const avatarSrc =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?bold=true&background=0D8ABC&color=fff&name=${
      profile?.full_name || user?.email || "User"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

     {/* LEFT */}
<div className="flex items-center gap-3">
  <Link href="/" className="flex items-center gap-2">
    <img
      src="/logo.png"
      alt="Fundora"
      className="h-10 w-auto object-contain"
    />
    <span className="text-xl font-semibold text-white">
      Fundora
    </span>
  </Link>
</div>


          <div className="hidden md:flex items-center gap-5 text-sm text-slate-300">
            <Link href="/" className="hover:text-blue-400">Explore</Link>
            <Link href="/create" className="hover:text-blue-400">
              Start a project
            </Link>
          </div>
        

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {!user && (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="inline-flex rounded-full bg-blue-600 px-4 py-1.5 text-xs text-white hover:bg-blue-500"
              >
                Sign up
              </Link>
            </>
          )}

          {user && (
            <>
              {/* ✉️ MESSAGES ICON WITH BADGE */}
              <Link
                href="/dm"
                className="relative text-slate-300 hover:text-white"
              >
                <FaEnvelope size={18} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white
                                   text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* AVATAR */}
              <div className="relative">
                <img
                  src={avatarSrc}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full cursor-pointer border border-slate-600"
                />

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg py-2 shadow-xl">

                    <Link
                      href={`/creator/${user.id}`}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                       onClick={() => router.push("/creator/payments")}
                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    >
                      Funds-Got
                    </button>

                    <button
                       type="button"
                       onClick={() => router.push("/creator/profile")}
                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    >
                      Edit Payment Portal
                    </button> 
                    <Link
  href="/payments"
  className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
>
  My Payments
</Link>
                   
                    <Link
                      href="/creator/edit"
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>

                    <Link
                      href="/followers"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Followers
                    </Link>

                    <Link
                      href="/account/delete"
                      className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                    >
                      Delete Account
                    </Link>

                    <button
                      onClick={async () => {
                        await signOutUser();
                        setMenuOpen(false);
                        setUser(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
