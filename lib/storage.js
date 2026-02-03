import { supabase } from "./supabaseClient";

export async function uploadFileToProject(file, projectId, type) {
  // ✅ Enforce size limit ONLY for thumbnails (extra safety)
  if (type === "thumbnail" && file.size > 10 * 1024 * 1024) {
    throw new Error("THUMBNAIL_TOO_LARGE");
  }

  // ✅ Choose bucket based on file type
  const bucketName = type === "thumbnail"
    ? "project-thumbnails"   // 👈 your new thumbnail bucket
    : "projects";            // 👈 existing bucket for all other media

  try {
    const ext = file.name.split(".").pop();
    const filePath = `${projectId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      filePath,
    };
  } catch (err) {
    console.error("Upload failed:", err);
    throw err; // 🔴 REQUIRED so create.js can show correct error message
  }
}
