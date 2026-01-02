// lib/projects.js
import { supabase } from "./supabaseClient";

/* -----------------------------
   CREATE NEW PROJECT
-------------------------------- */
export async function createProject(projectData) {
  const {
    title,
    short,
    description,
    goal,
    deadline,
    prototypeUrl,
    owner_id
  } = projectData;

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        title,
        short,
        description,
        goal,
        deadline,
        prototypeUrl,
        owner_id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* -----------------------------
   UPDATE PROJECT
-------------------------------- */
export async function updateProject(id, updateData) {
  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* -----------------------------
   DELETE PROJECT
-------------------------------- */
export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  return true;
}
