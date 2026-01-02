import { deleteProject } from "../../../lib/projects";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE")
      return res.status(405).json({ error: "Method not allowed" });

    const { id } = req.query;

    await deleteProject(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
