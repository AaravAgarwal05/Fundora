// SAME FILE PATH
// FULL FINAL VERSION — SAFE TO REPLACE

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabaseClient";

export default function FundProject() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [donors, setDonors] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);
// REALTIME FUNDING UPDATE
useEffect(() => {
  if (!id) return;

  const channel = supabase
    .channel("fund-project-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "projects",
        filter: `id=eq.${id}`,
      },
      (payload) => {
        setProject(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [id]);

  async function loadData() {
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!projectData) return;
    setProject(projectData);

    const { data: creatorData } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", projectData.owner_id)
      .single();

    setCreator(creatorData || null);

    const { data: donorList } = await supabase
      .from("public_donations")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    setDonors(donorList || []);
  }

  async function handlePayment() {
    if (!amount || Number(amount) <= 0)
      return alert("Enter valid amount");

    if (!paymentProof)
      return alert("Upload payment screenshot");

    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const payer = auth?.user;

    const ext = paymentProof.name.split(".").pop();
    const path = `payments/${Date.now()}-${payer?.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("payments")
      .upload(path, paymentProof);

    if (uploadError) {
      alert("Upload failed");
      setLoading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("payments")
      .getPublicUrl(path);

    await supabase.from("payments").insert({
      project_id: id,
      creator_id: creator?.user_id,
      payer_id: payer?.id || null,
      amount: Number(amount),
      status: "submitted",
      receipt_url: publicUrl.publicUrl,
      payer_name: payer?.user_metadata?.name || null,
      payer_email: payer?.email || null,
    });

    setAmount("");
    setPaymentProof(null);
    setPreviewUrl(null);
    setLoading(false);

    alert("Payment submitted. Await creator verification.");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto p-6 space-y-6">

        {/* PROJECT */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h1 className="text-2xl font-bold text-white">{project?.title}</h1>
          <p className="text-slate-400">{project?.short}</p>
        </div>

        {/* CREATOR */}
        {creator && (
          <div className="flex gap-4 border border-slate-800 p-4 rounded-lg">
            {creator.photo && (
              <img
                src={creator.photo}
                className="w-24 h-24 object-cover rounded"
              />
            )}

            <div>
              <p className="text-white font-semibold">{creator.name}</p>
              <p className="text-slate-400">Email: {creator.email}</p>
              <p className="text-slate-400">Mobile: {creator.mobile}</p>

              {creator.upi_qr && (
                <img
                  src={creator.upi_qr}
                  className="w-40 mt-3 border rounded"
                />
              )}
            </div>
          </div>
        )}

        {/* PAYMENT FORM */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-white font-semibold">Support this project</h2>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="input"
          />

          <label className="block cursor-pointer bg-slate-800 border border-slate-700 rounded-lg p-4 text-white hover:bg-slate-700">
            Upload payment screenshot
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setPaymentProof(file);
                setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </label>

          {previewUrl && (
            <img
              src={previewUrl}
              className="max-w-xs border rounded"
            />
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Submitting..." : "I Have Paid"}
          </button>
        </div>

        {/* DONORS */}
        {donors.length > 0 && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-white font-semibold mb-3">
              Recent Supporters
            </h3>

            {donors.map((d) => (
              <div key={d.id} className="flex justify-between text-slate-300">
                <span>{d.name || "Anonymous"}</span>
                <span className="text-green-400">₹{d.amount}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
