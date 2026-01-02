import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  const { paymentId } = req.query;

  const { data: payment } = await supabase
    .from("payments")
    .select("*, projects(title), creators(name,email)")
    .eq("id", paymentId)
    .single();

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Payment Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Project: ${payment.projects.title}`, 20, 40);
  doc.text(`Amount: ₹${payment.amount}`, 20, 50);
  doc.text(`Status: VERIFIED`, 20, 60);
  doc.text(`Payer: ${payment.payer_name || "Anonymous"}`, 20, 70);
  doc.text(`Email: ${payment.payer_email || "-"}`, 20, 80);
  doc.text(`Date: ${new Date(payment.created_at).toLocaleString()}`, 20, 90);

  const pdf = doc.output("arraybuffer");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${payment.id}.pdf`
  );

  res.send(Buffer.from(pdf));
}
