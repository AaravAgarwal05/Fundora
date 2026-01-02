import { supabase } from "./supabaseClient";

export async function uploadPaymentScreenshot(file, paymentId) {
  const ext = file.name.split(".").pop();
  const path = `${paymentId}.${ext}`;

  const { error } = await supabase.storage
    .from("payments")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from("payments")
    .getPublicUrl(path);

  return data.publicUrl;
}
