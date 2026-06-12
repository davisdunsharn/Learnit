import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import api from "../api/axios";
import {
  IconBook2, IconPlus, IconLogout, IconChevronDown, IconChevronRight,
  IconNote, IconFolder, IconSearch, IconX, IconSend, IconArrowLeft,
  IconSparkles, IconBulb, IconHelpCircle, IconLayoutGrid, IconCalendar,
  IconTrash, IconEdit, IconCheck, IconLoader2, IconUpload, IconCopy,
  IconFileText, IconPhoto, IconMessageCircle, IconRefresh, IconTrophy,
  IconTarget, IconBolt, IconNotes, IconChevronLeft, IconPencil,
} from "@tabler/icons-react";

// ── helpers ────────────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6","#ec4899","#14b8a6"];
const colorFor = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const firstLine = (text = "") => text.split("\n")[0].trim() || "Untitled";
const timeAgo = (ts) => {
  const d = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
};

// ── empty states ───────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, text, sub, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)" }}>
      <Icon size={24} style={{ color: "#6366f1" }} />
    </div>
    <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>{text}</p>
    {sub && <p className="text-xs text-center max-w-xs" style={{ color: "#94a3b8" }}>{sub}</p>}
    {action && (
      <button onClick={action} className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
        style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1.5px solid rgba(99,102,241,0.2)" }}>
        <IconPlus size={14} /> {actionLabel}
      </button>
    )}
  </div>
);

// ── card style ─────────────────────────────────────────────────────────────
const card = { background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" };
const inp = "w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition";
const inpStyle = { background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" };
const onFocus = e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; };
const onBlur  = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)"; };

export default function Dashboard() {
  const { user, logout, userName } = useAuth();

  // ── state ──
  const [subjects, setSubjects]         = useState([]);
  const [notes, setNotes]               = useState([]);
  const [expanded, setExpanded]         = useState({});      // which subjects are open in sidebar
  const [activeSubject, setActiveSubject] = useState(null);  // current subject open
  const [activeTab, setActiveTab]       = useState("chat");  // chat | quiz | studyplan
  const [activeNote, setActiveNote]     = useState(null);    // note being edited/viewed
  const [notesPanel, setNotesPanel]     = useState(false);   // slide-in notes panel
  const [view, setView]                 = useState("home");  // home | subject | allnotes | newnote
  const [chats, setChats]               = useState({});      // { subjectId: [messages] }
  const [chatInput, setChatInput]       = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [search, setSearch]             = useState("");
  const [noteSearch, setNoteSearch]     = useState("");
  const [loading, setLoading]           = useState(true);

  // modals
  const [addSubjModal, setAddSubjModal] = useState(false);
  const [newSubjName, setNewSubjName]   = useState("");
  const [subjError, setSubjError]       = useState("");
  const [addingSubj, setAddingSubj]     = useState(false);

  // note editing
  const [editNote, setEditNote]         = useState({ title: "", content: "" });
  const [savingNote, setSavingNote]     = useState(false);
  const [noteError, setNoteError]       = useState("");

  // quiz
  const [quizAnswers, setQuizAnswers]   = useState({});
  const [quizData, setQuizData]         = useState(null);
  const [quizLoading, setQuizLoading]   = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // file drop in chat
  const fileRef    = useRef(null);
  const chatEndRef = useRef(null);

  // ── load data ──────────────────────────────────────────────────────────
  const loadSubjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    setSubjects(data || []);
  }, [user]);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .select("*, subjects(id, name)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    setNotes(data || []);
  }, [user]);

  const loadChats = useCallback(async (subjectId) => {
    if (!user || !subjectId) return;
    const { data } = await supabase
      .from("subject_chats")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setChats(prev => ({ ...prev, [subjectId]: data || [] }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([loadSubjects(), loadNotes()]).finally(() => setLoading(false));
  }, [user, loadSubjects, loadNotes]);

  useEffect(() => {
    if (activeSubject) loadChats(activeSubject.id);
  }, [activeSubject, loadChats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeSubject]);

  // ── subjects ───────────────────────────────────────────────────────────
  const addSubject = async () => {
    if (!newSubjName.trim()) return setSubjError("Subject name is required.");
    setAddingSubj(true);
    setSubjError("");
    const { error } = await supabase.from("subjects").insert([{
      user_id: user.id,
      name: newSubjName.trim(),
      colour: colorFor(newSubjName.trim()),
    }]);
    setAddingSubj(false);
    if (error) {
      if (error.code === "23505") return setSubjError("You already have a subject with that name.");
      return setSubjError("Something went wrong. Try again.");
    }
    setNewSubjName("");
    setAddSubjModal(false);
    loadSubjects();
  };

  const deleteSubject = async (subj) => {
    if (!window.confirm(`Remove "${subj.name}"? Notes inside it will also be hidden.`)) return;
    await supabase.from("subjects").update({ deleted_at: new Date().toISOString() }).eq("id", subj.id);
    if (activeSubject?.id === subj.id) { setActiveSubject(null); setView("home"); }
    loadSubjects();
    loadNotes();
  };

  const openSubject = (subj) => {
    setActiveSubject(subj);
    setActiveTab("chat");
    setView("subject");
    setNotesPanel(false);
    setQuizData(null);
    setQuizAnswers({});
  };

  // ── notes ──────────────────────────────────────────────────────────────
  const openNewNote = (subjectId = null) => {
    setEditNote({ title: "", content: "", subject_id: subjectId || activeSubject?.id || null, id: null });
    setNoteError("");
    setView("newnote");
    setNotesPanel(false);
  };

  const openNote = (note) => {
    setEditNote({ id: note.id, title: note.title, content: note.content, subject_id: note.subject_id });
    setNoteError("");
    setView("newnote");
    setNotesPanel(false);
  };

  const saveNote = async () => {
    if (!editNote.content.trim()) return setNoteError("Note cannot be empty.");
    setSavingNote(true);
    setNoteError("");
    const title = firstLine(editNote.content) || "Untitled";
    if (editNote.id) {
      await supabase.from("notes").update({
        title,
        content: editNote.content,
        updated_at: new Date().toISOString(),
      }).eq("id", editNote.id);
    } else {
      await supabase.from("notes").insert([{
        user_id: user.id,
        subject_id: editNote.subject_id || null,
        title,
        content: editNote.content,
      }]);
    }
    setSavingNote(false);
    loadNotes();
    // go back to where we came from
    if (activeSubject) { setView("subject"); setNotesPanel(true); }
    else setView("allnotes");
  };

  const deleteNote = async (note) => {
    if (!window.confirm(`Remove "${note.title}"?`)) return;
    await supabase.from("notes").update({ deleted_at: new Date().toISOString() }).eq("id", note.id);
    if (view === "newnote") {
      if (activeSubject) { setView("subject"); setNotesPanel(true); }
      else setView("allnotes");
    }
    loadNotes();
  };

  // ── chat ───────────────────────────────────────────────────────────────
  const sendMessage = async (text = chatInput, fileData = null) => {
    if (!text.trim() && !fileData) return;
    if (!activeSubject) return;
    const subId = activeSubject.id;
    const userMsg = { role: "user", content: text.trim(), file_name: fileData?.name };
    setChatInput("");
    setAiLoading(true);

    // save user message
    await supabase.from("subject_chats").insert([{
      subject_id: subId, user_id: user.id,
      role: "user", content: text.trim() || `[file: ${fileData?.name}]`,
      file_name: fileData?.name || null,
    }]);

    setChats(prev => ({ ...prev, [subId]: [...(prev[subId] || []), { ...userMsg, created_at: new Date().toISOString() }] }));

    // get last 10 messages for context
    const history = (chats[subId] || []).slice(-10).map(m => ({ role: m.role, content: m.content }));

    // subject notes as context
    const subjectNotes = notes.filter(n => n.subject_id === subId).map(n => n.content).join("\n\n").slice(0, 2000);
    const systemPrompt = `You are a helpful AI study tutor for the subject "${activeSubject.name}". 
The student's notes for this subject are:\n${subjectNotes || "No notes yet."}\n
Help the student understand concepts, answer questions, and study effectively. Be clear and concise.`;

    try {
      const res = await api.post("/ai/chat", {
        messages: [...history, { role: "user", content: text.trim() || `The student uploaded a file: ${fileData?.name}` }],
        system: systemPrompt,
      });
      const reply = res.data.result;

      await supabase.from("subject_chats").insert([{
        subject_id: subId, user_id: user.id,
        role: "assistant", content: reply,
      }]);

      setChats(prev => ({
        ...prev,
        [subId]: [...(prev[subId] || []), { role: "assistant", content: reply, created_at: new Date().toISOString() }]
      }));
    } catch {
      setChats(prev => ({
        ...prev,
        [subId]: [...(prev[subId] || []), { role: "assistant", content: "Sorry, something went wrong. Try again.", created_at: new Date().toISOString() }]
      }));
    }
    setAiLoading(false);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
    if (!allowed.includes(file.type)) return alert("Only images, PDFs and PPTX files are supported.");
    sendMessage(`I uploaded a file called "${file.name}". Can you help me understand it?`, { name: file.name });
  };

  // ── AI tools on notes ──────────────────────────────────────────────────
  const runAI = async (type) => {
    if (!activeNote && view !== "newnote") return;
    const content = editNote.content || activeNote?.content;
    if (!content?.trim()) return alert("Add some content to the note first.");
    setAiLoading(true);
    try {
      const res = await api.post(`/ai/${type}`, { content, note_id: editNote.id || activeNote?.id });
      // save to ai_results if we have a note id
      if (editNote.id || activeNote?.id) {
        await supabase.from("ai_results").insert([{
          note_id: editNote.id || activeNote.id,
          type,
          result: JSON.stringify(res.data.result),
        }]);
      }
      if (type === "quiz") {
        setQuizData(res.data.result);
        setQuizAnswers({});
        setActiveTab("quiz");
      } else {
       setAiResult({ type, content: res.data.result });
      }
    } catch {
      alert("AI is unavailable right now. Try again.");
    }
    setAiLoading(false);
  };

  // ── filtered notes ─────────────────────────────────────────────────────
  const subjectNotes = (subId) => notes.filter(n => n.subject_id === subId);
  const filteredAllNotes = notes.filter(n =>
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  // ── sidebar toggle ─────────────────────────────────────────────────────
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4ff" }}>
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  const currentChats = activeSubject ? (chats[activeSubject.id] || []) : [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f4ff" }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="w-60 flex flex-col shrink-0 overflow-hidden" style={{ background: "#fff", borderRight: "1px solid #e2e8f0", boxShadow: "2px 0 12px rgba(15,23,42,0.05)" }}>

        {/* logo */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
            <IconBook2 size={16} className="text-white" />
          </div>
          <span className="syne text-lg font-bold" style={{ color: "#0f172a" }}>LearnIt</span>
        </div>

        {/* new chat button */}
        <div className="px-3 pt-3">
          <button onClick={() => { setActiveSubject(null); setView("home"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition"
            style={{ background: "rgba(99,102,241,0.06)", color: "#6366f1", border: "1.5px solid rgba(99,102,241,0.15)" }}>
            <IconPlus size={14} /> New Chat
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-2 pt-3 pb-2">

          {/* all notes link */}
          <button onClick={() => { setView("allnotes"); setActiveSubject(null); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition mb-1"
            style={{ color: view === "allnotes" ? "#6366f1" : "#64748b", background: view === "allnotes" ? "rgba(99,102,241,0.08)" : "transparent", fontWeight: view === "allnotes" ? 600 : 400 }}>
            <IconNotes size={15} /> Notes
          </button>

          {/* subjects section */}
          <div className="flex items-center justify-between px-3 py-1.5 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Subjects</span>
            <button onClick={() => setAddSubjModal(true)} className="transition" style={{ color: "#94a3b8" }}
              onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
              <IconPlus size={13} />
            </button>
          </div>

          {subjects.length === 0 && (
            <p className="text-xs px-3 py-2" style={{ color: "#cbd5e1" }}>No subjects yet</p>
          )}

          {subjects.map(subj => {
            const color = subj.colour || colorFor(subj.name);
            const isOpen = expanded[subj.id];
            const isActive = activeSubject?.id === subj.id;
            const sNotes = subjectNotes(subj.id);
            return (
              <div key={subj.id}>
                {/* subject row */}
                <div className="flex items-center gap-1 rounded-xl px-1 py-0.5 group transition"
                  style={{ background: isActive ? "rgba(99,102,241,0.06)" : "transparent" }}>
                  <button onClick={() => toggleExpand(subj.id)} className="p-1 rounded-lg transition" style={{ color: "#94a3b8" }}>
                    {isOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                  </button>
                  <button onClick={() => openSubject(subj)}
                    className="flex-1 flex items-center gap-2 py-1.5 text-sm text-left transition"
                    style={{ color: isActive ? "#6366f1" : "#374151", fontWeight: isActive ? 600 : 400 }}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ background: color }}>{initials(subj.name)}</span>
                    <span className="truncate text-xs">{subj.name}</span>
                  </button>
                  <button onClick={() => deleteSubject(subj)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition"
                    style={{ color: "#f43f5e" }}>
                    <IconTrash size={11} />
                  </button>
                </div>

                {/* expanded notes under subject */}
                {isOpen && (
                  <div className="ml-7 mb-1">
                    {sNotes.map(n => (
                      <button key={n.id} onClick={() => openNote(n)}
                        className="w-full text-left px-2 py-1 rounded-lg text-xs truncate transition"
                        style={{ color: "#64748b" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8faff"; e.currentTarget.style.color = "#6366f1"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#64748b"; }}>
                        {n.title}
                      </button>
                    ))}
                    <button onClick={() => openNewNote(subj.id)}
                      className="w-full text-left px-2 py-1 rounded-lg text-xs transition flex items-center gap-1"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#6366f1"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; }}>
                      <IconPlus size={10} /> Add note
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* user */}
        <div className="p-3" style={{ borderTop: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl" style={{ background: "#f8faff", border: "1.5px solid #e2e8f0" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {userName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate capitalize" style={{ color: "#0f172a" }}>{userName}</div>
              <div className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{user?.email}</div>
            </div>
            <button onClick={logout} className="transition shrink-0 p-1 rounded-lg" style={{ color: "#cbd5e1" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f43f5e"; e.currentTarget.style.background = "rgba(244,63,94,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = ""; }}>
              <IconLogout size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── HOME ── */}
        {view === "home" && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-8 py-10 max-w-3xl mx-auto w-full">
              <h1 className="text-3xl font-bold mb-1" style={{ color: "#0f172a" }}>Good day, {userName} 👋</h1>
              <p className="text-sm mb-8" style={{ color: "#64748b" }}>Pick a subject to start studying or create a new note.</p>

              {/* stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Notes", val: notes.length, icon: IconNote, color: "#6366f1" },
                  { label: "Subjects", val: subjects.length, icon: IconFolder, color: "#06b6d4" },
                  { label: "AI results", val: 0, icon: IconSparkles, color: "#10b981" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={card}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                      <s.icon size={16} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: "#0f172a" }}>{s.val}</div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* subjects grid */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Your Subjects</h2>
                <button onClick={() => setAddSubjModal(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6366f1" }}>
                  <IconPlus size={12} /> Add
                </button>
              </div>
              {subjects.length === 0 ? (
                <Empty icon={IconFolder} text="No subjects yet" sub="Create a subject to organise your notes and start studying." action={() => setAddSubjModal(true)} actionLabel="Add Subject" />
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {subjects.map(subj => {
                    const color = subj.colour || colorFor(subj.name);
                    return (
                      <button key={subj.id} onClick={() => openSubject(subj)}
                        className="card-hover rounded-2xl p-4 text-left transition"
                        style={card}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: color }}>{initials(subj.name)}</div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>{subj.name}</div>
                            <div className="text-xs" style={{ color: "#94a3b8" }}>{subjectNotes(subj.id).length} notes</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* recent notes */}
              {notes.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Recent Notes</h2>
                    <button onClick={() => setView("allnotes")} className="text-xs font-semibold" style={{ color: "#6366f1" }}>View all</button>
                  </div>
                  <div className="space-y-2">
                    {notes.slice(0, 4).map(n => (
                      <button key={n.id} onClick={() => openNote(n)}
                        className="w-full card-hover rounded-2xl p-4 text-left transition"
                        style={card}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>{n.title}</span>
                          <span className="text-[10px]" style={{ color: "#94a3b8" }}>{timeAgo(n.updated_at)}</span>
                        </div>
                        <p className="text-xs line-clamp-1" style={{ color: "#94a3b8" }}>{n.content.split("\n").slice(1).join(" ").trim() || "No preview"}</p>
                        {n.subjects && (
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${colorFor(n.subjects.name)}15`, color: colorFor(n.subjects.name) }}>
                            {n.subjects.name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ALL NOTES ── */}
        {view === "allnotes" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(255,255,255,0.9)" }}>
              <h1 className="text-base font-bold flex-1" style={{ color: "#0f172a" }}>All Notes</h1>
              <div className="relative">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="Search notes…"
                  className="rounded-xl pl-8 pr-4 py-2 text-sm outline-none w-48"
                  style={{ background: "#f8faff", border: "1.5px solid #e2e8f0", color: "#0f172a" }}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>
              <button onClick={() => openNewNote()}
                className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.25)" }}>
                <IconPlus size={14} /> New Note
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAllNotes.length === 0 ? (
                <Empty icon={IconNote} text="No notes found" sub="Create your first note to get started." action={() => openNewNote()} actionLabel="New Note" />
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredAllNotes.map(n => (
                    <button key={n.id} onClick={() => openNote(n)}
                      className="card-hover rounded-2xl p-4 text-left transition"
                      style={card}>
                      <div className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: "#0f172a" }}>{n.title}</div>
                      <p className="text-xs line-clamp-3 mb-3" style={{ color: "#94a3b8" }}>{n.content.split("\n").slice(1).join(" ").trim() || n.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: "#cbd5e1" }}>{timeAgo(n.updated_at)}</span>
                        {n.subjects && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${colorFor(n.subjects.name)}15`, color: colorFor(n.subjects.name) }}>
                            {n.subjects.name}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NOTE EDITOR ── */}
        {view === "newnote" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* topbar */}
            <div className="flex items-center gap-3 px-6 py-3 shrink-0" style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(255,255,255,0.9)" }}>
              <button onClick={() => {
                if (activeSubject) { setView("subject"); setNotesPanel(true); }
                else setView("allnotes");
              }} className="flex items-center gap-1.5 text-sm transition" style={{ color: "#94a3b8" }}
                onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                <IconArrowLeft size={16} /> Back
              </button>
              <span className="flex-1 text-sm font-medium truncate" style={{ color: "#64748b" }}>
                {editNote.id ? "Edit note" : "New note"}
                {activeSubject && <span style={{ color: "#94a3b8" }}> · {activeSubject.name}</span>}
              </span>
              {noteError && <span className="text-xs" style={{ color: "#f43f5e" }}>{noteError}</span>}
              {editNote.id && (
                <button onClick={() => deleteNote({ id: editNote.id, title: editNote.title })}
                  className="p-1.5 rounded-lg transition" style={{ color: "#f43f5e" }}>
                  <IconTrash size={15} />
                </button>
              )}
              <button onClick={saveNote} disabled={savingNote}
                className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                style={{ background: savingNote ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {savingNote ? <IconLoader2 size={14} className="animate-spin" /> : <IconCheck size={14} />}
                Save
              </button>
            </div>

            {/* editor */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
                {/* auto title preview */}
                <div className="text-xs mb-3 font-medium" style={{ color: "#94a3b8" }}>
                  Title: <span style={{ color: "#6366f1" }}>{firstLine(editNote.content) || "First line becomes the title"}</span>
                </div>
                <textarea
                  autoFocus
                  value={editNote.content}
                  onChange={e => { setEditNote(prev => ({ ...prev, content: e.target.value })); setNoteError(""); }}
                  placeholder={"Start writing...\n\nThe first line becomes your note title automatically."}
                  className="w-full outline-none resize-none text-sm leading-8"
                  style={{ background: "transparent", color: "#0f172a", minHeight: "60vh", fontFamily: "inherit" }}
                />
              </div>

              {/* AI tools panel */}
              <div className="w-52 shrink-0 p-4 overflow-y-auto" style={{ borderLeft: "1px solid #e2e8f0", background: "#fafbff" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#94a3b8" }}>AI Tools</div>
                <div className="space-y-2">
                  {[
                    { label: "Summarise", icon: IconFileText, type: "summary" },
                    { label: "Explain simply", icon: IconBulb, type: "explain" },
                    { label: "Generate quiz", icon: IconHelpCircle, type: "quiz" },
                    { label: "Flashcards", icon: IconLayoutGrid, type: "flashcards" },
                  ].map(tool => (
                    <button key={tool.type} onClick={() => runAI(tool.type)} disabled={aiLoading}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition text-left"
                      style={{ border: "1.5px solid #e2e8f0", color: "#475569", background: "#fff" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "#fff"; }}>
                      {aiLoading ? <IconLoader2 size={13} className="animate-spin" /> : <tool.icon size={13} />}
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBJECT VIEW ── */}
        {view === "subject" && activeSubject && (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* subject topbar */}
            <div className="flex items-center gap-3 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(255,255,255,0.95)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: activeSubject.colour || colorFor(activeSubject.name) }}>
                {initials(activeSubject.name)}
              </div>
              <span className="font-semibold text-sm flex-1" style={{ color: "#0f172a" }}>{activeSubject.name}</span>

              {/* tab switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#f1f5f9" }}>
                {[
                  { id: "chat", icon: IconMessageCircle, label: "Chat" },
                  { id: "quiz", icon: IconHelpCircle, label: "Quiz" },
                  { id: "studyplan", icon: IconCalendar, label: "Plan" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    style={{
                      background: activeTab === tab.id ? "#fff" : "transparent",
                      color: activeTab === tab.id ? "#6366f1" : "#64748b",
                      boxShadow: activeTab === tab.id ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                    }}>
                    <tab.icon size={13} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* notes panel toggle */}
              <button onClick={() => setNotesPanel(!notesPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                style={{ background: notesPanel ? "rgba(99,102,241,0.08)" : "#f1f5f9", color: notesPanel ? "#6366f1" : "#64748b", border: notesPanel ? "1.5px solid rgba(99,102,241,0.2)" : "1.5px solid transparent" }}>
                <IconNote size={13} /> Notes {subjectNotes(activeSubject.id).length > 0 && `(${subjectNotes(activeSubject.id).length})`}
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">

              {/* ── CHAT TAB ── */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col overflow-hidden"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}>

                  {/* messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {currentChats.length === 0 && (
                      <Empty icon={IconMessageCircle} text={`Chat about ${activeSubject.name}`}
                        sub="Ask questions, get explanations, or discuss your notes. Your conversation is saved." />
                    )}
                    {currentChats.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            <IconSparkles size={12} className="text-white" />
                          </div>
                        )}
                        <div className="max-w-lg">
                          {msg.file_name && (
                            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl mb-1"
                              style={{ background: "#f1f5f9", color: "#64748b" }}>
                              <IconUpload size={12} /> {msg.file_name}
                            </div>
                          )}
                          <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                            {msg.content}
                          </div>
                          {msg.role === "assistant" && (
                            <div className="flex gap-2 mt-1.5 px-1">
                              <button onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="flex items-center gap-1 text-[10px] transition" style={{ color: "#94a3b8" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                                <IconCopy size={10} /> Copy
                              </button>
                              <button onClick={() => openNewNote(activeSubject.id)}
                                className="flex items-center gap-1 text-[10px] transition" style={{ color: "#94a3b8" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                                <IconPlus size={10} /> Add to notes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          <IconSparkles size={12} className="text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl text-sm chat-bubble-bot">
                          <div className="flex gap-1">
                            {[0,1,2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "#94a3b8", animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* input */}
                  <div className="px-5 pb-5 pt-3 shrink-0" style={{ borderTop: "1px solid #e2e8f0" }}>
                    <div className="flex gap-2 items-end rounded-2xl p-2" style={{ background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
                      <button onClick={() => fileRef.current?.click()}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition"
                        style={{ background: "#f8faff", color: "#6366f1" }}>
                        <IconPlus size={16} />
                      </button>
                      <input ref={fileRef} type="file" className="hidden"
                        accept="image/*,.pdf,.pptx"
                        onChange={handleFileDrop} />
                      <textarea
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder={`Message ${activeSubject.name}…`}
                        rows={1}
                        className="flex-1 outline-none resize-none text-sm py-1.5"
                        style={{ background: "transparent", color: "#0f172a", maxHeight: "120px" }}
                      />
                      <button onClick={() => sendMessage()} disabled={!chatInput.trim() || aiLoading}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition"
                        style={{ background: chatInput.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0", color: chatInput.trim() ? "#fff" : "#94a3b8" }}>
                        <IconSend size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-center mt-2" style={{ color: "#cbd5e1" }}>Drop images, PDFs or PPTX files · Enter to send · Shift+Enter for new line</p>
                  </div>
                </div>
              )}

              {/* ── QUIZ TAB ── */}
              {activeTab === "quiz" && (
                <div className="flex-1 overflow-y-auto p-6">
                  {!quizData ? (
                    <div className="max-w-xl mx-auto">
                      <Empty icon={IconHelpCircle} text="No quiz yet"
                        sub="Open a note and click Generate Quiz, or generate one from your subject notes below." />
                      <div className="mt-4 space-y-3">
                        {subjectNotes(activeSubject.id).slice(0, 3).map(n => (
                          <button key={n.id} onClick={() => { openNote(n); }}
                            className="w-full card-hover rounded-2xl p-4 text-left transition"
                            style={card}>
                            <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>{n.title}</div>
                            <p className="text-xs mt-1 line-clamp-1" style={{ color: "#94a3b8" }}>{n.content.slice(0, 80)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold" style={{ color: "#0f172a" }}>Quiz</h2>
                        <button onClick={() => { setQuizData(null); setQuizAnswers({}); }}
                          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition"
                          style={{ border: "1.5px solid #e2e8f0", color: "#64748b" }}>
                          <IconRefresh size={14} /> Reset
                        </button>
                      </div>
                      {Object.keys(quizAnswers).length === quizData.length && (
                        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
                          style={{ background: "rgba(99,102,241,0.06)", border: "1.5px solid rgba(99,102,241,0.2)" }}>
                          <IconTrophy size={18} style={{ color: "#6366f1" }} />
                          <div>
                            <div className="text-sm font-bold" style={{ color: "#0f172a" }}>
                              Score: {quizData.filter((q, i) => quizAnswers[i] === q.answer).length} / {quizData.length}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-4">
                        {quizData.map((q, qi) => (
                          <div key={qi} className="rounded-2xl p-5" style={card}>
                            <div className="text-sm font-semibold mb-4" style={{ color: "#0f172a" }}>{qi + 1}. {q.question}</div>
                            {q.options ? (
                              <div className="space-y-2">
                                {q.options.map((opt, oi) => {
                                  const answered = quizAnswers[qi] !== undefined;
                                  const selected = quizAnswers[qi] === oi;
                                  const correct  = oi === q.answer;
                                  let st = {};
                                  if (answered && selected && correct)  st = { borderColor: "#10b981", background: "rgba(16,185,129,0.07)", color: "#059669", fontWeight: 600 };
                                  if (answered && selected && !correct) st = { borderColor: "#f43f5e", background: "rgba(244,63,94,0.07)", color: "#f43f5e" };
                                  if (answered && !selected && correct) st = { borderColor: "#10b981", background: "rgba(16,185,129,0.07)", color: "#059669", opacity: 0.5 };
                                  return (
                                    <button key={oi} disabled={answered} onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                      className="quiz-opt w-full text-left px-4 py-2.5 rounded-xl text-sm"
                                      style={{ ...st, cursor: answered ? "default" : "pointer" }}>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <textarea rows={3} placeholder="Type your answer…" className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                                style={{ background: "#f8faff", border: "1.5px solid #e2e8f0", color: "#0f172a" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STUDY PLAN TAB ── */}
              {activeTab === "studyplan" && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-base font-bold mb-5" style={{ color: "#0f172a" }}>Study Plan for {activeSubject.name}</h2>
                    <div className="grid gap-4">
                      {[
                        { title: "This week", icon: IconBolt, color: "#6366f1", items: ["Review all notes in this subject", "Complete at least one quiz", "Create flashcards for key terms"] },
                        { title: "Daily focus", icon: IconTarget, color: "#06b6d4", items: subjectNotes(activeSubject.id).slice(0, 3).map(n => `Review: ${n.title}`) },
                        { title: "Goals", icon: IconTrophy, color: "#10b981", items: ["Summarise each note using AI", "Test yourself with the quiz", "Use the chat to ask questions"] },
                      ].map((col, i) => (
                        <div key={i} className="rounded-2xl p-5" style={card}>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${col.color}15` }}>
                              <col.icon size={15} style={{ color: col.color }} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: "#0f172a" }}>{col.title}</span>
                          </div>
                          <div className="space-y-2">
                            {col.items.length === 0 ? (
                              <p className="text-xs" style={{ color: "#94a3b8" }}>Add notes to this subject to get a personalised plan.</p>
                            ) : col.items.map((item, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: col.color }} />
                                <p className="text-sm" style={{ color: "#475569" }}>{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTES PANEL (slide-in right) ── */}
              {notesPanel && (
                <div className="w-64 shrink-0 flex flex-col overflow-hidden" style={{ borderLeft: "1px solid #e2e8f0", background: "#fafbff" }}>
                  <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Notes</span>
                    <button onClick={() => openNewNote(activeSubject.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                      style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                      <IconPlus size={13} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {subjectNotes(activeSubject.id).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs" style={{ color: "#94a3b8" }}>No notes yet</p>
                        <button onClick={() => openNewNote(activeSubject.id)}
                          className="mt-3 text-xs font-medium" style={{ color: "#6366f1" }}>
                          Add your first note
                        </button>
                      </div>
                    ) : (
                      subjectNotes(activeSubject.id).map(n => (
                        <button key={n.id} onClick={() => openNote(n)}
                          className="w-full text-left p-3 rounded-xl mb-1 transition"
                          style={{ background: "transparent" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}>
                          <div className="text-xs font-semibold line-clamp-1 mb-0.5" style={{ color: "#0f172a" }}>{n.title}</div>
                          <div className="text-[10px] line-clamp-2" style={{ color: "#94a3b8" }}>{n.content.split("\n").slice(1).join(" ").trim() || "No preview"}</div>
                          <div className="text-[10px] mt-1.5" style={{ color: "#cbd5e1" }}>{timeAgo(n.updated_at)}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ ADD SUBJECT MODAL ══ */}
      {addSubjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}>
          <div className="glass-strong rounded-3xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold mb-1" style={{ color: "#0f172a" }}>New Subject</h3>
            <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>Give it a clear name — this becomes your study space.</p>
            {subjError && <p className="text-xs mb-3 font-medium" style={{ color: "#f43f5e" }}>{subjError}</p>}
            <input autoFocus value={newSubjName} onChange={e => { setNewSubjName(e.target.value); setSubjError(""); }}
              onKeyDown={e => e.key === "Enter" && addSubject()}
              placeholder="e.g. Internet Programming"
              className={`${inp} mb-4`} style={inpStyle} onFocus={onFocus} onBlur={onBlur} />
            <div className="flex gap-2">
              <button onClick={() => { setAddSubjModal(false); setNewSubjName(""); setSubjError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ border: "1.5px solid #e2e8f0", color: "#64748b" }}>Cancel</button>
              <button onClick={addSubject} disabled={addingSubj}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.25)" }}>
                {addingSubj ? <IconLoader2 size={14} className="animate-spin" /> : null}
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

{/* AI RESULT MODAL */}
      {aiResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-6 w-full max-w-lg mx-4 flex flex-col"
            style={{ background: "#fff", boxShadow: "0 20px 60px rgba(15,23,42,0.2)", maxHeight: "80vh" }}>

            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <IconSparkles size={14} className="text-white" />
                </div>
                <h3 className="text-base font-bold capitalize" style={{ color: "#0f172a" }}>
                  {aiResult.type === "summary" ? "Summary" : "Explanation"}
                </h3>
              </div>
              <button onClick={() => setAiResult(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                style={{ background: "#f1f5f9", color: "#64748b" }}>
                <IconX size={14} />
              </button>
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto rounded-2xl p-4 text-sm leading-7 whitespace-pre-wrap"
              style={{ background: "#f8faff", border: "1.5px solid #e2e8f0", color: "#374151" }}>
              {aiResult.content}
            </div>

            {/* footer */}
            <div className="flex gap-2 mt-4">
              <button onClick={() => navigator.clipboard.writeText(aiResult.content)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                style={{ border: "1.5px solid #e2e8f0", color: "#64748b" }}>
                <IconCopy size={13} /> Copy
              </button>
              <button onClick={() => setAiResult(null)}
                className="flex-1 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
