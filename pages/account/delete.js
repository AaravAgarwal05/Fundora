import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabaseClient";

export default function DeleteAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete your account?")) {
      return;
    }

    setLoading(true);

    const userId = user.id;

    // Delete profile
    await supabase.from("profiles").delete().eq("id", userId);

    // Delete projects owned by user
    await supabase.from("projects").delete().eq("owner_id", userId);

    // Delete saved projects
    await supabase.from("saved_projects").delete().eq("user_id", userId);

    // Delete team entries
    await supabase.from("team_members").delete().eq("creator_id", userId);

    // Call serverless function to delete user from auth.users
    await fetch("/api/deleteUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    await supabase.auth.signOut();

    alert("Your account has been deleted.");
    window.location.href = "/";
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Delete Account</h1>

        <p className="text-slate-300 mb-6">
          This action is permanent. Your profile, projects, saved items, and
          account will be removed forever and cannot be restored.
        </p>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg font-semibold transition"
        >
          {loading ? "Deleting..." : "Delete My Account"}
        </button>
      </main>

      <Footer />
    </div>
  );
}
