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

  /* SEND MESSAGE */
  async function sendMessage(text) {
    if (!text.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase.from("messages").insert({
      project_id: projectId,
      sender_id: user.id,
      content: text,
    });
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}
