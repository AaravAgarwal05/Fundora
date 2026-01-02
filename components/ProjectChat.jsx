import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaSmile, FaPaperclip } from "react-icons/fa";

const EMOJIS = ["😀", "😂", "😍", "🔥", "👍", "🎉", "😎", "🤝", "💡", "🚀"];

export default function ProjectChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);

  // ROLE DATA
  const [projectOwnerId, setProjectOwnerId] = useState(null);
  const [teamMemberIds, setTeamMemberIds] = useState([]);

  // UI STATES
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- LOAD ROLES ---------------- */
  useEffect(() => {
    if (!projectId) return;

    async function loadRoles() {
      const { data: project } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", projectId)
        .single();

      setProjectOwnerId(project?.owner_id || null);

      const { data: team } = await supabase
        .from("team_members")
        .select("creator_id")
        .eq("project_id", projectId);

      setTeamMemberIds(team?.map((m) => m.creator_id) || []);
    }

    loadRoles();
  }, [projectId]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!projectId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("project_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    }

    loadMessages();

    const channel = supabase
      .channel(`project-chat-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [projectId]);

  /* ---------------- SEND MESSAGE ---------------- */
  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;

    await supabase.from("project_messages").insert({
      project_id: projectId,
      sender_id: user.id,
      sender_name: user.email,
      content: text.trim(),
      attachment_url: null,
      attachment_type: null,
    });

    setText("");
    setShowEmojis(false);
  }

  /* ---------------- FILE UPLOAD ---------------- */
  async function uploadFile(file) {
    if (!file || !user) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${projectId}/${Date.now()}-${user.id}.${ext}`;

    const { error } = await supabase.storage
      .from("chat_attachments")
      .upload(path, file);

    if (error) {
      alert("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("chat_attachments")
      .getPublicUrl(path);

    await supabase.from("project_messages").insert({
      project_id: projectId,
      sender_id: user.id,
      sender_name: user.email,
      content: null,
      attachment_url: data.publicUrl,
      attachment_type: file.type.startsWith("image")
        ? "image"
        : "file",
    });

    setUploading(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  }

  /* ---------------- ROLE HELPERS ---------------- */
  function getUserRole(userId) {
    if (userId === projectOwnerId) return "Owner";
    if (teamMemberIds.includes(userId)) return "Team";
    return "Member";
  }

  function roleBadgeClass(role) {
    if (role === "Owner") return "bg-yellow-500 text-black";
    if (role === "Team") return "bg-blue-600 text-white";
    return "bg-slate-600 text-white";
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-700 text-white font-semibold">
        Project Chat
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((msg) => {
          const role = getUserRole(msg.sender_id);
          const isMe = user?.id === msg.sender_id;

          return (
            <div key={msg.id} className={`mb-3 ${isMe ? "text-right" : ""}`}>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="text-slate-200">{msg.sender_name}</span>
                <span
                  className={`px-2 py-[2px] rounded-full ${roleBadgeClass(
                    role
                  )}`}
                >
                  {role}
                </span>
              </div>

              <div
                className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[75%] break-words ${
                  isMe
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {msg.content && <p>{msg.content}</p>}

                {msg.attachment_url && msg.attachment_type === "image" && (
                  <img
                    src={msg.attachment_url}
                    className="mt-2 rounded-lg max-h-48"
                  />
                )}

                {msg.attachment_url && msg.attachment_type === "file" && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    className="text-blue-400 underline mt-2 block"
                  >
                    Download file
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* EMOJI PICKER */}
      {showEmojis && (
        <div className="border-t border-slate-700 p-2 flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setText((t) => t + e)}
              className="text-xl"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      {user && (
        <form
          onSubmit={sendMessage}
          className="border-t border-slate-700 p-3 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setShowEmojis((s) => !s)}
            className="text-slate-300 hover:text-white shrink-0"
          >
            <FaSmile />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="text-slate-300 hover:text-white shrink-0"
          >
            <FaPaperclip />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 min-w-0 bg-slate-800 text-white rounded-lg px-3 py-2"
            placeholder="Type a message..."
          />

          <button
            disabled={uploading}
            className="bg-cyan-600 px-4 py-2 rounded-lg text-white shrink-0"
          >
            {uploading ? "..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
