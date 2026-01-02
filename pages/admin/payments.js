import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    supabase.from("payments").select("*").then(({ data }) => setPayments(data));
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">All Payments</h1>

      {payments.map(p => (
        <div key={p.id} className="border p-3 mb-3 rounded">
          <p>Amount: ₹{p.amount}</p>
          <p>Status: {p.status}</p>
          <p>Project: {p.project_id}</p>
        </div>
      ))}
    </div>
  );
}
