import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PaymentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [payment, setPayment] = useState(null);
  const [project, setProject] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadPayment();
  }, [id]);

  async function loadPayment() {
    setLoading(true);

    // 1️⃣ Get payment
    const { data: paymentData, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !paymentData) {
      setLoading(false);
      return;
    }

    setPayment(paymentData);

    // 2️⃣ Get project
    if (paymentData.project_id) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("title")
        .eq("id", paymentData.project_id)
        .single();

      setProject(projectData);
    }

    // 3️⃣ Get receipt
    const { data: receiptData } = await supabase
      .from("receipts")
      .select("*")
      .eq("payment_id", paymentData.id)
      .single();

    setReceipt(receiptData || null);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Payment not found
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Payment Details
        </h1>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">

          <p className="text-lg text-white font-semibold">
            Amount: ₹{payment.amount}
          </p>

          <p className="text-slate-300">
            Project: {project?.title || "—"}
          </p>

          <p className="text-slate-300">
            Status:{" "}
            <span
              className={
                payment.status === "verified"
                  ? "text-green-400"
                  : payment.status === "rejected"
                  ? "text-red-400"
                  : "text-yellow-400"
              }
            >
              {payment.status}
            </span>
          </p>

          <p className="text-slate-400 text-sm">
            Payment ID: {payment.id}
          </p>

          {receipt?.pdf_url && (
            <a
              href={receipt.pdf_url}
              target="_blank"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
            >
              Download Receipt (PDF)
            </a>
          )}

          {!receipt?.pdf_url && (
            <p className="text-slate-400 text-sm">
              Receipt will be available after verification.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
