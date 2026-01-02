import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("payments")
      .select(`
        *,
        projects(title),
        receipts(pdf_url)
      `)
      .eq("payer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments(data || []));
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          My Payments
        </h1>

        {payments.length === 0 && (
          <p className="text-slate-400">You have not made any payments yet.</p>
        )}

        <div className="space-y-4">
          {payments.map((p) => (
            <Link key={p.id} href={`/payments/${p.id}`}>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition">
                
                <p className="text-white text-lg font-semibold">
                  ₹{p.amount}
                </p>

                <p className="text-slate-400 text-sm">
                  Project: {p.projects?.title}
                </p>

                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={
                      p.status === "verified"
                        ? "text-green-400"
                        : p.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  >
                    {p.status}
                  </span>
                </p>

                {p.status === "verified" && p.receipts?.pdf_url && (
                  <p className="mt-3 text-blue-400 underline">
                    View / Download Receipt
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
