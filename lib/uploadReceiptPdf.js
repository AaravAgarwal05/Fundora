import { supabase } from "./supabaseClient";

export async function uploadReceiptPdf(blob, paymentId) {
  const path = `receipts/${paymentId}.pdf`;

  const { error } = await supabase.storage
    .from("payments")
    .upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("payments").getPublicUrl(path);
  return data.publicUrl;
}
