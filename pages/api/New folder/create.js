import { uploadFileToProject } from "../../../lib/storage";
import { createProject } from "../../../lib/projects";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method Not Allowed" });

    const {
      title,
      short_description,
      description,
      goal,
      deadline,
      prototype_url,
      owner_id,
      owner_name,
      mediaFiles,
      teamMembers,
    } = req.body;

    // 1. Create basic project entry first
    const project = await createProject({
      title,
      short_description,
      description,
      goal,
      deadline,
      prototype_url,
      owner_id,
      owner_name,
      pledged: 0,
    });

    // 2. Upload media
    let uploadedMediaUrls = [];

    if (mediaFiles?.length > 0) {
      for (const base64File of mediaFiles) {
        const buffer = Buffer.from(base64File.data, "base64");

        const fileObj = {
          name: base64File.name,
          arrayBuffer: async () => buffer,
        };

        const url = await uploadFileToProject(fileObj, project.id);
        if (url) uploadedMediaUrls.push(url);
      }
    }

    // 3. Insert into media table
    if (uploadedMediaUrls.length > 0) {
      const mediaInsert = uploadedMediaUrls.map((url) => ({
        project_id: project.id,
        url,
      }));

      await supabase.from("media").insert(mediaInsert);
    }

    // 4. Team members
    if (teamMembers?.length > 0) {
      const teamInsert = teamMembers.map((m) => ({
        project_id: project.id,
        name: m.name,
        role: m.role,
      }));

      await supabase.from("team_members").insert(teamInsert);
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
