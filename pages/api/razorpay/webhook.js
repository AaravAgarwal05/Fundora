import crypto from "crypto";
import { supabase } from "../../../lib/supabaseClient";

export const config = {
  api: {
    bodyParser: false, // REQUIRED
  },
};

export default async function handler(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const rawBody = Buffer.concat(buffers).toString("utf8");

  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(rawBody);

  /* ---------------- PAYMENT CAPTURED ---------------- */
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const projectId = payment.notes?.projectId;
    const amount = payment.amount / 100; // paise → rupees
    const payerEmail = payment.email || null;

    if (!projectId) return res.json({ ok: true });

    // 1️⃣ Insert donation
    await supabase.from("public_donations").insert({
      project_id: projectId,
      amount,
      payer_email: payerEmail,
      payment_id: payment.id,
      status: "success",
    });

    // 2️⃣ Update pledged amount
    await supabase.rpc("increment_project_pledge", {
      project_id: projectId,
      amount,
    });
  }

  /* ---------------- PAYMENT FAILED ---------------- */
  if (event.event === "payment.failed") {
    console.log("Payment failed:", event.payload.payment.entity.id);
  }

  /* ---------------- REFUND ---------------- */
  if (event.event === "refund.processed") {
    console.log("Refund processed:", event.payload.refund.entity.id);
  }

  return res.json({ success: true });
}
