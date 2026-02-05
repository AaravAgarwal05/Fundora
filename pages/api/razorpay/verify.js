import crypto from "crypto";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      projectId,
      amount,
      payerId, // ✅ coming from frontend
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    /* ✅ Store donation */
    await supabase.from("public_donations").insert({
      project_id: projectId,
      amount,
      payer_id: payerId, // ✅ FIXED
      razorpay_payment_id,
      razorpay_order_id,
      status: "paid",
    });

    /* ✅ Update project funding */
    await supabase.rpc("increment_project_funding", {
      project_id: projectId,
      amount,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ success: false });
  }
}
