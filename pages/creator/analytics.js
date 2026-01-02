import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";

export default function Analytics() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { data: user } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("payments")
      .select("amount, created_at")
      .eq("creator_id", user.user.id)
      .eq("status", "approved");

    setStats(data || []);
  }

  const total = stats.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Funding Analytics</h1>

      <p className="text-lg mb-2">Total Raised: ₹{total}</p>
      <p>Total Donations: {stats.length}</p>
    </div>
  );
}
