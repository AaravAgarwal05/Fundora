import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabaseClient";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- LOAD PAYMENTS ---------------- */
  useEffect(() => {
    if (!user) return;

    loadPayments();
  }, [user]);

  async function loadPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("public_donations")
      .select(
        `
        id,
        amount,
        status,
        created_at,
        projects (
          id,
          title
        )
      `
      )
      .eq("payer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("My Payments error:", error);
      setPayments([]);
      setLoading(false);
      return;
    }

    setPayments(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          My Payments
        </h1>

        {loading && (
          <p className="text-slate-400">Loading payments...</p>
        )}

        {!loading && payments.length === 0 && (
          <p className="text-slate-400">No payments made yet.</p>
        )}

        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-700 rounded-xl p-5"
            >
              <p className="text-white text-lg font-semibold">
                ₹{p.amount}
              </p>

              <p className="text-slate-400 text-sm">
                Project: {p.projects?.title || "Unknown"}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {new Date(p.created_at).toLocaleString()}
              </p>

              <p className="text-xs mt-1">
                Status:{" "}
                <span className="text-green-400 capitalize">
                  {p.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
