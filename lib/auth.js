// lib/auth.js
import { supabase } from "./supabaseClient";

// Create new user
export async function signUpEmail(email, password) {
  return await supabase.auth.signUp({ email, password });
}

// Sign in user
export async function signInEmail(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Sign out
export async function signOutUser() {
  return await supabase.auth.signOut();
}

// Get current logged-in user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
