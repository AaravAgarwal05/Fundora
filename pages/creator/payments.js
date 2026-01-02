import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { generateReceipt } from "../../lib/generateReceipt";
import { uploadReceiptPdf } from "../../lib/uploadReceiptPdf";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CreatorPayments() {
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadPayments();

    const channel = supabase
      .channel("creator-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `creator_id=eq.${user.id}`,
        },
        () => loadPayments()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  async function loadPayments() {
    const { data } = await supabase
      .from("payments")
      .select("*, projects(title)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    setPayments(data || []);
  }

  async function approvePayment(payment) {
    setLoadingId(payment.id);

    // 1️⃣ mark verified
    await supabase
      .from("payments")
      .update({ status: "verified" })
      .eq("id", payment.id);


    // 2️⃣ increment project funding
    await supabase.rpc("increment_project_amount", {
      project_id_input: payment.project_id,
      amount_input: payment.amount,
    });

    // 3️⃣ fetch project + creator
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", payment.project_id)
      .single();

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", payment.creator_id)
      .single();

    // 4️⃣ generate receipt (returns Blob)
const blob = await generateReceipt(payment, project, creator);

// 5️⃣ upload receipt
const pdfUrl = await uploadReceiptPdf(blob, payment.id);


    // 6️⃣ save receipt record
    await supabase.from("receipts").insert({
      payment_id: payment.id,
      pdf_url: pdfUrl,
      emailed_to_creator: true,
      emailed_to_payer: true,
    });

    // 7️⃣ email
    await fetch("/api/send-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toCreator: creator.email,
        toPayer: payment.payer_email,
        project: project.title,
        amount: payment.amount,
        receiptUrl: pdfUrl,
      }),
    });

    setLoadingId(null);
    loadPayments();
  }

  async function rejectPayment(paymentId) {
    await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
    loadPayments();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Payment Requests
        </h1>

        {payments.length === 0 && (
          <p className="text-slate-400">No payments yet.</p>
        )}

        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-700 rounded-xl p-5"
            >
              <p className="text-white text-lg font-semibold">₹{p.amount}</p>

              <p className="text-sm text-slate-400">
                Project: {p.projects?.title}
              </p>

              <p className="text-xs text-slate-500 mt-1">
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

              {p.receipt_url && (
                <img
                  src={p.receipt_url}
                  className="mt-3 max-h-64 rounded border"
                />
              )}

              {p.status === "submitted" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => approvePayment(p)}
                    disabled={loadingId === p.id}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    {loadingId === p.id ? "Approving..." : "Approve"}
                  </button>

                  <button
                    onClick={() => rejectPayment(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {p.status === "verified" && (
                <p className="text-green-400 mt-2">
                  ✅ Payment verified & receipt sent
                </p>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
