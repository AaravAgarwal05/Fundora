import { uploadFileToProject } from "../../../lib/storage";
import { updateProject } from "../../../lib/projects";

export default async function handler(req, res) {
  try {
    if (req.method !== "PUT")
      return res.status(405).json({ error: "Method not allowed" });

    const {
      id,
      title,
      short_description,
      description,
      goal,
      deadline,
      prototype_url,
      mediaFiles,
      teamMembers,
    } = req.body;

    const updated = await updateProject(id, {
      title,
      short_description,
      description,
      goal,
      deadline,
      prototype_url,
    });

    // Upload new files
    if (mediaFiles?.length > 0) {
      let fileUrls = [];
      for (const file of mediaFiles) {
        const buffer = Buffer.from(file.data, "base64");

        const fileObj = {
          name: file.name,
          arrayBuffer: async () => buffer,
        };

        const url = await uploadFileToProject(fileObj, id);
        if (url) fileUrls.push(url);
      }

      await supabase.from("media").insert(
        fileUrls.map((url) => ({
          project_id: id,
          url,
        }))
      );
    }

    // Update team members
    await supabase.from("team_members").delete().eq("project_id", id);
    await supabase.from("team_members").insert(
      teamMembers.map((m) => ({
        project_id: id,
        name: m.name,
        role: m.role,
      }))
    );

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
