// hooks/useProjectChat.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useProjectChat(projectId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* LOAD INITIAL MESSAGES */
  useEffect(() => {
    if (!projectId) return;

    async function loadMessages() {
      setLoading(true);

      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          sender_id,
          created_at,
          is_ai,
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
      setLoading(false);
    }

    loadMessages();
  }, [projectId]);

  /* REALTIME SUBSCRIPTION */
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-chat-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  /* SEND MESSAGE + AI RESPONSE */
  async function sendMessage(text) {
    if (!text.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // 1️⃣ Save user message
    await supabase.from("messages").insert({
      project_id: projectId,
      sender_id: user.id,
      content: text,
      is_ai: false,
    });

    try {
      // 2️⃣ Call AI Agent API
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          projectId,
        }),
      });

      const data = await res.json();

      // 3️⃣ Save AI response
      await supabase.from("messages").insert({
        project_id: projectId,
        content: data.reply,
        is_ai: true,
      });

    } catch (err) {
      console.error("AI Error:", err);
    }
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}