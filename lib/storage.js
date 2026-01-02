// lib/storage.js
import { supabase } from "./supabaseClient";

export async function uploadFileToProject(file, projectId) {
  try {
    const ext = file.name.split(".").pop();
    const filePath = `${projectId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("projects").getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      filePath,
    };
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}
