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
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment data' });
    }

    if (!projectId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing project data' });
    }

    // 🔐 Create signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ❌ Invalid signature
    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed:', { expected: expectedSignature, received: razorpay_signature });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    /* ✅ Store donation */
    await supabase.from("public_donations").insert({
      project_id: projectId,
      amount,
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
