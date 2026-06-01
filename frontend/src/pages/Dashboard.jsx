import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  IconHome, IconNote, IconFolder, IconCalendar, IconHelpCircle,
  IconLayoutGrid, IconScan, IconBook, IconMessagePlus, IconMessageCircle,
  IconArrowLeft, IconSparkles, IconBook2, IconBulb, IconEdit,
  IconRefresh, IconPlus, IconLogout, IconSend, IconSearch,
  IconTrash, IconTrophy, IconCopy, IconX, IconChevronRight,
  IconBolt, IconTarget,
} from "@tabler/icons-react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id:1, name:"Internet Programming", abbr:"IP", notes:4, color:"#6366f1", bg:"rgba(99,102,241,0.10)", border:"rgba(99,102,241,0.25)", updated:"Today",     img:"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=60" },
  { id:2, name:"Data Structures",      abbr:"DS", notes:3, color:"#06b6d4", bg:"rgba(6,182,212,0.10)",  border:"rgba(6,182,212,0.25)",  updated:"Yesterday", img:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60" },
  { id:3, name:"Software Engineering", abbr:"SE", notes:3, color:"#10b981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.25)", updated:"Monday",    img:"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=60" },
  { id:4, name:"Database Systems",     abbr:"DB", notes:2, color:"#f59e0b", bg:"rgba(245,158,11,0.10)", border:"rgba(245,158,11,0.25)", updated:"Sunday",    img:"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60" },
  { id:5, name:"Mathematics",          abbr:"M",  notes:5, color:"#f43f5e", bg:"rgba(244,63,94,0.10)",  border:"rgba(244,63,94,0.25)",  updated:"Today",     img:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=60" },
  { id:6, name:"Business Studies",     abbr:"BS", notes:2, color:"#8b5cf6", bg:"rgba(139,92,246,0.10)", border:"rgba(139,92,246,0.25)", updated:"Last week", img:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=60" },
];

const NOTES = [
  { id:1, sid:1, title:"RESTful API Design",    preview:"REST uses standard HTTP methods to manage resources. Stateless architecture.", date:"Today 14:32",  content:"REST stands for Representational State Transfer.\n\n• GET — retrieve data\n• POST — create new data\n• PUT — update existing data\n• DELETE — remove data\n\nStateless: each request contains all needed info." },
  { id:2, sid:2, title:"Binary Search Trees",   preview:"BST: left < parent < right. O(log n) average for search, insert, delete.", date:"Yesterday",     content:"A BST is a binary tree where:\n• Left subtree < parent\n• Right subtree > parent\n\nOperations (average):\n• Search: O(log n)\n• Insert: O(log n)\n• Delete: O(log n)" },
  { id:3, sid:3, title:"Agile & Scrum",         preview:"Iterative sprints of 1-4 weeks. Daily standups, sprint reviews, retrospectives.", date:"Mon, 10 May", content:"Agile: iterative approach to software dev.\n\nScrum roles:\n• Product Owner\n• Scrum Master\n• Dev Team\n\nCeremonies:\n• Daily Standup (15 min)\n• Sprint Review\n• Retrospective" },
  { id:4, sid:4, title:"Normalisation 1NF–3NF", preview:"1NF: atomic values. 2NF: no partial deps. 3NF: no transitive deps.", date:"Sun, 9 May",  content:"Normalisation reduces data redundancy.\n\n1NF: Atomic values, no repeating groups\n2NF: No partial dependencies\n3NF: No transitive dependencies\nBCNF: Every determinant is a candidate key" },
  { id:5, sid:5, title:"Calculus Fundamentals", preview:"Derivatives, integrals, chain rule. f'(x) is the instantaneous rate of change.", date:"Today 09:11", content:"Derivatives: f'(x) = lim(h→0) [f(x+h)-f(x)]/h\n\nChain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)\n\nIntegration: reverse of differentiation\n∫x^n dx = x^(n+1)/(n+1) + C" },
];

const QUIZ_BANK = {
  1: [
    { q:"What does REST stand for?",           opts:["Remote Execution State Transfer","Representational State Transfer","Relational State Transfer","Request State Transfer"], ans:1 },
    { q:"Which HTTP method retrieves data?",   opts:["POST","PUT","GET","DELETE"], ans:2 },
    { q:"What does 'stateless' mean in REST?", opts:["Server stores sessions","Each request is self-contained","Client remembers past requests","Requests are compressed"], ans:1 },
    { q:"Which status code means 'Not Found'?",opts:["200","301","404","500"], ans:2 },
  ],
  2: [
    { q:"BST average search time complexity?", opts:["O(n)","O(n²)","O(log n)","O(1)"], ans:2 },
    { q:"In a BST, where does the left child go?", opts:["Greater than parent","Equal to parent","Less than parent","Random"], ans:2 },
    { q:"Worst case BST complexity (unbalanced)?", opts:["O(log n)","O(n)","O(1)","O(n²)"], ans:1 },
    { q:"Which traversal visits: left → root → right?", opts:["Pre-order","In-order","Post-order","Level-order"], ans:1 },
  ],
  3: [
    { q:"Which Scrum ceremony is 15 minutes daily?", opts:["Sprint Review","Retrospective","Daily Standup","Sprint Planning"], ans:2 },
    { q:"What is a Sprint in Scrum?",            opts:["A bug fix","A 1-4 week iteration","A deployment","A meeting"], ans:1 },
    { q:"Who owns the product backlog?",         opts:["Scrum Master","Dev Team","Product Owner","Stakeholders"], ans:2 },
    { q:"What does Agile prioritise over processes?", opts:["Documentation","Tools","Individuals","Contracts"], ans:2 },
  ],
  4: [
    { q:"1NF requires atomic values — what does that mean?", opts:["No NULL values","Indivisible cell values","No foreign keys","Unique rows"], ans:1 },
    { q:"2NF removes what type of dependency?", opts:["Transitive","Partial","Functional","Multi-valued"], ans:1 },
    { q:"3NF removes what type of dependency?", opts:["Partial","Multi-valued","Transitive","Join"], ans:2 },
    { q:"BCNF stands for?",                     opts:["Boyce–Codd Normal Form","Basic Common Normal Form","Binary Column Normal Form","Base Condition Normal Form"], ans:0 },
  ],
  5: [
    { q:"What is the derivative of x²?",        opts:["x","2x","2","x³/3"], ans:1 },
    { q:"∫x dx = ?",                            opts:["x","x²","x²/2 + C","2x + C"], ans:2 },
    { q:"Chain rule: d/dx[f(g(x))] = ?",        opts:["f'(x)·g(x)","f(g'(x))","f'(g(x))·g'(x)","f'(x) + g'(x)"], ans:2 },
    { q:"What is f'(x) when f(x) = constant?",  opts:["1","The constant","0","Undefined"], ans:2 },
  ],
  6: [
    { q:"What does GDP stand for?",             opts:["Gross Domestic Product","General Development Plan","Global Distribution Protocol","Government Debt Percentage"], ans:0 },
    { q:"Supply and demand: price rises when?", opts:["Supply > demand","Demand > supply","Both equal","Neither changes"], ans:1 },
    { q:"A monopoly has how many sellers?",     opts:["Many","Two","One","Zero"], ans:2 },
    { q:"Fixed costs are costs that?",          opts:["Change with output","Stay constant regardless of output","Only exist in the short run","Are always zero"], ans:1 },
  ],
};

const FC_BANK = {
  1: [{ term:"REST", def:"Representational State Transfer — API style using standard HTTP methods." },{ term:"Stateless", def:"Each API request contains all info needed — server stores no session." },{ term:"Endpoint", def:"A URL path that responds to API requests, e.g. /api/notes." }],
  2: [{ term:"BST", def:"Binary Search Tree — left < parent < right. Average O(log n) operations." },{ term:"In-order", def:"BST traversal: left → root → right. Gives sorted output." },{ term:"Balanced", def:"A BST where height is O(log n), keeping operations efficient." }],
  3: [{ term:"Scrum", def:"Agile framework with sprints, standups, reviews, and retrospectives." },{ term:"Sprint", def:"A time-boxed iteration (1-4 weeks) that produces a usable increment." },{ term:"Backlog", def:"An ordered list of features and tasks to be completed." }],
  4: [{ term:"1NF", def:"First Normal Form — atomic values only, no repeating groups." },{ term:"2NF", def:"1NF + no partial dependencies on a composite primary key." },{ term:"3NF", def:"2NF + no transitive dependencies between non-key attributes." }],
  5: [{ term:"Derivative", def:"f'(x) — the instantaneous rate of change of a function." },{ term:"Integral", def:"∫f(x)dx — the area under a curve; reverse of differentiation." },{ term:"Chain Rule", def:"d/dx[f(g(x))] = f'(g(x))·g'(x) — derivative of composite functions." }],
  6: [{ term:"GDP", def:"Gross Domestic Product — total value of goods/services produced in a country." },{ term:"Monopoly", def:"A market structure with a single seller controlling supply." },{ term:"Fixed Cost", def:"A cost that remains constant regardless of output level." }],
};

const Nav = [
  { id:"home",       icon:IconHome,        label:"Home" },
  { id:"notes",      icon:IconNote,        label:"Notes" },
  { id:"subjects",   icon:IconFolder,      label:"Subjects" },
  { id:"studyplan",  icon:IconCalendar,    label:"Study Plan" },
  { id:"quiz",       icon:IconHelpCircle,  label:"Quiz" },
  { id:"flashcards", icon:IconLayoutGrid,  label:"Flashcards" },
  { id:"scan",       icon:IconScan,        label:"Scan" },
  { id:"dictionary", icon:IconBook,        label:"Dictionary" },
  { id:"chat",       icon:IconMessagePlus, label:"Chat" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [page, setPage]          = useState("home");
  const [subjects, setSubjects]  = useState(SUBJECTS);
  const [notes, setNotes]        = useState(NOTES);
  const [activeNote, setActiveNote] = useState(null);
  const [noteFilter, setFilter]  = useState("All");
  const [search, setSearch]      = useState("");

  const [quizSubjId, setQuizSubjId] = useState(null);
  const [quizA, setQuizA]           = useState({});

  const [fcSubjId, setFcSubjId] = useState(null);
  const [flipped, setFlipped]   = useState({});

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const chatEndRef   = useRef(null);
  const fileInputRef = useRef(null);

  const [dictSearch, setDictSearch] = useState("");
  const [scannedText, setScannedText] = useState("Chapter 4 — Network Protocols\n\nHTTP is the foundation of data communication on the web. HTTPS adds SSL/TLS encryption to protect data in transit.");

  const [newSubj, setNewSubj]   = useState("");
  const [addSubjM, setAddSubjM] = useState(false);
  const [newNote, setNewNote]   = useState({ title:"", subject:"", content:"" });
  const [noteModal, setNoteM]   = useState(false);

  const go = (p, resetNote = true) => { setPage(p); if (resetNote) setActiveNote(null); };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  const sendChatMessage = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages(m => [...m, { role:"user", text: msg }]);
    setChatInput("");
    const lower = msg.toLowerCase();
    let reply = "";
    if (lower.includes("summar"))     reply = "I'll help you summarize your notes! Go to the Notes section to review and organize them by topic.";
    else if (lower.includes("quiz"))  reply = "Head to the Quiz section to test your knowledge! You can select different subjects to challenge yourself.";
    else if (lower.includes("flash")) reply = "Great idea! Go to the Cards section to create or review flashcards for key terms and definitions.";
    else if (lower.includes("plan"))  reply = "I recommend creating a study plan by breaking down your subjects into daily goals. Start with your weakest areas first.";
    else if (lower.includes("explain") || lower.includes("what is") || lower.includes("how")) reply = "Break down the concept into smaller parts. Start with the basics, then explore how different elements connect together.";
    else if (lower.includes("help"))  reply = "I'm here to help! You can ask me about study tips, note organization, quiz strategies, and more. What would you like to know?";
    else reply = "That's an interesting question! Based on your studies, I'd recommend exploring this topic further in your notes or flashcards. Need more help?";
    setTimeout(() => {
      setChatMessages(m => [...m, { role:"assistant", text: reply }]);
    }, 600 + Math.random() * 400);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatMessages(m => [...m, { role:"user", text: `📎 Uploaded: ${file.name}` }]);
      setTimeout(() => {
        setChatMessages(m => [...m, { role:"assistant", text: `Great! I've received your file "${file.name}". How can I help you with this?` }]);
      }, 500);
    }
  };

  const addSubject = () => {
    if (!newSubj.trim()) return;
    const cols = ["#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6"];
    const c = cols[subjects.length % cols.length];
    setSubjects([...subjects, { id:Date.now(), name:newSubj.trim(), abbr:newSubj.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(), notes:0, color:c, bg:`${c}1A`, border:`${c}40`, updated:"Just now", img:"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=60" }]);
    setNewSubj(""); setAddSubjM(false);
  };

  const saveNote = () => {
    if (!newNote.title || !newNote.subject) return;
    const subj = subjects.find(s => s.name === newNote.subject);
    setNotes([{ id:Date.now(), sid:subj?.id||0, title:newNote.title, preview:newNote.content.slice(0,80), date:"Just now", content:newNote.content }, ...notes]);
    setSubjects(subjects.map(s => s.name === newNote.subject ? { ...s, notes: s.notes+1 } : s));
    setNewNote({ title:"", subject:"", content:"" }); setNoteM(false);
  };

  const filtNotes = notes.filter(n => {
    const s = subjects.find(x=>x.id===n.sid);
    return (noteFilter==="All" || s?.name===noteFilter) &&
           (n.title.toLowerCase().includes(search.toLowerCase()) || (s?.name||"").toLowerCase().includes(search.toLowerCase()));
  });
  const subjectOf = n => subjects.find(s=>s.id===n.sid);

  const quizSubject = subjects.find(s=>s.id===quizSubjId);
  const currentQuiz = quizSubjId ? (QUIZ_BANK[quizSubjId] || []) : [];
  const currentFC   = fcSubjId   ? (FC_BANK[fcSubjId]     || []) : [];

  // ── Input style helper ──
  const inp = "w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition";
  const inpStyle = { background:"#fff", border:"1.5px solid #e2e8f0", color:"#0f172a", boxShadow:"0 1px 4px rgba(15,23,42,0.05)" };
  const onFocus = e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; };
  const onBlur  = e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="0 1px 4px rgba(15,23,42,0.05)"; };

  // ── Note Detail ──
  const renderNoteDetail = () => {
    if (!activeNote) {
      return (
        <div className="fade-up p-6 text-center">
          <div className="max-w-md mx-auto rounded-3xl p-10" style={{ background:"#fff", border:"1.5px solid #e2e8f0", boxShadow:"0 4px 20px rgba(15,23,42,0.06)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:"rgba(99,102,241,0.08)" }}>
              <IconNote size={24} style={{ color:"#6366f1" }} />
            </div>
            <p className="font-semibold mb-2" style={{ color:"#0f172a" }}>No note selected</p>
            <p className="text-sm mb-5" style={{ color:"#64748b" }}>Choose a note from the Notes screen to view its details.</p>
            <button onClick={()=>go("notes")} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
              style={{ background:"rgba(99,102,241,0.08)", color:"#6366f1", border:"1.5px solid rgba(99,102,241,0.2)" }}>
              <IconArrowLeft size={16} /> Back to notes
            </button>
          </div>
        </div>
      );
    }

    const s = subjectOf(activeNote);
    return (
      <div className="fade-up flex min-h-[64vh] gap-5 flex-col xl:flex-row p-6">
        <div className="flex-1 rounded-3xl overflow-hidden" style={{ background:"#fff", border:"1.5px solid #e2e8f0", boxShadow:"0 4px 20px rgba(15,23,42,0.06)" }}>
          <button onClick={()=>go("notes")} className="flex items-center gap-2 text-sm m-5 transition" style={{ color:"#94a3b8" }}
            onMouseEnter={e=>e.currentTarget.style.color="#6366f1"} onMouseLeave={e=>e.currentTarget.style.color="#94a3b8"}>
            <IconArrowLeft size={16} /> Back to notes
          </button>
          {s?.img && (
            <div className="relative w-full h-44 overflow-hidden mb-5">
              <img src={s.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background:`linear-gradient(to bottom, transparent 40%, #fff)` }} />
            </div>
          )}
          <div className="px-6 pb-6">
            <span className="pill mb-4 inline-block" style={{ background:s?.bg, color:s?.color, border:`1.5px solid ${s?.border}` }}>{s?.name || "General"}</span>
            <h2 className="text-3xl font-bold mb-2" style={{ color:"#0f172a" }}>{activeNote.title}</h2>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color:"#94a3b8" }}>{activeNote.date}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              {[
                ["Subject",   s?.name || "General"],
                ["Preview",   activeNote.preview],
                ["Words",     activeNote.content.split(/\s+/).filter(Boolean).length],
                ["Read time", Math.max(1, Math.ceil(activeNote.content.split(/\s+/).filter(Boolean).length / 180)) + " min"],
              ].map(([label, val]) => (
                <div key={label} className="rounded-2xl p-4" style={{ background:"#f8faff", border:"1.5px solid #e2e8f0" }}>
                  <div className="text-[11px] uppercase font-semibold tracking-wider mb-1.5" style={{ color:"#94a3b8" }}>{label}</div>
                  <div className="text-sm font-medium line-clamp-2" style={{ color:"#0f172a" }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="text-sm leading-8 whitespace-pre-line" style={{ color:"#475569" }}>{activeNote.content}</div>
            <div className="mt-8 pt-6 flex flex-wrap gap-2" style={{ borderTop:"1px solid #e2e8f0" }}>
              {activeNote.title.split(" ").filter(w=>w.length>3).slice(0,5).map(w => (
                <span key={w} className="text-xs px-3 py-1 rounded-full transition" style={{ border:"1.5px solid #e2e8f0", color:"#94a3b8" }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full xl:w-72 rounded-3xl p-5" style={{ background:"#fff", border:"1.5px solid #e2e8f0", boxShadow:"0 4px 20px rgba(15,23,42,0.06)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(99,102,241,0.10)" }}>
              <IconSparkles size={16} style={{ color:"#6366f1" }} />
            </div>
            <span className="text-sm font-bold" style={{ color:"#0f172a" }}>AI Tools</span>
          </div>
          <div className="space-y-2">
            {[
              { icon:IconNote,        label:"Summarise",  action:()=>go("notes") },
              { icon:IconBulb,        label:"Explain it", action:()=>go("dictionary") },
              { icon:IconHelpCircle,  label:"Quiz me",    action:()=>go("quiz") },
              { icon:IconLayoutGrid,  label:"Flashcards", action:()=>go("flashcards") },
              { icon:IconCalendar,    label:"Study plan", action:()=>go("studyplan") },
              { icon:IconEdit,        label:"Notes",      action:()=>go("notes") },
            ].map((b,i) => (
              <button key={i} onClick={b.action}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition text-left"
                style={{ border:"1.5px solid #e2e8f0", color:"#475569" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(99,102,241,0.06)"; e.currentTarget.style.borderColor="rgba(99,102,241,0.25)"; e.currentTarget.style.color="#6366f1"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=""; e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}>
                <b.icon size={16} />{b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Shared card style ──
  const card = { background:"#fff", border:"1.5px solid #e2e8f0", boxShadow:"0 2px 8px rgba(15,23,42,0.06)" };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:"#f0f4ff" }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="w-64 flex flex-col shrink-0" style={{ background:"#fff", borderRight:"1px solid #e2e8f0", boxShadow:"2px 0 12px rgba(15,23,42,0.05)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom:"1px solid #f1f5f9" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            <IconBook2 size={18} className="text-white" />
          </div>
          <span className="syne text-xl font-bold" style={{ color:"#0f172a" }}>LearnIt</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {Nav.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => go(n.id)}
                className="nav-pill w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border transition"
                style={{
                  background: active ? "rgba(99,102,241,0.08)" : "transparent",
                  color: active ? "#6366f1" : "#64748b",
                  borderColor: active ? "rgba(99,102,241,0.2)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}>
                <n.icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop:"1px solid #f1f5f9" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background:"#f8faff", border:"1.5px solid #e2e8f0" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 text-white"
              style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {user?.name?.[0]||"U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate capitalize" style={{ color:"#0f172a" }}>{user?.name}</div>
              <div className="text-[11px] truncate" style={{ color:"#94a3b8" }}>{user?.email}</div>
            </div>
            <button onClick={logout} className="transition shrink-0 p-1 rounded-lg"
              style={{ color:"#cbd5e1" }}
              onMouseEnter={e=>{ e.currentTarget.style.color="#f43f5e"; e.currentTarget.style.background="rgba(244,63,94,0.08)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="#cbd5e1"; e.currentTarget.style.background=""; }}>
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ background:"rgba(255,255,255,0.9)", borderBottom:"1px solid #e2e8f0", backdropFilter:"blur(16px)" }}>
          <div className="flex-1">
            <h1 className="text-lg font-bold capitalize" style={{ color:"#0f172a" }}>
              {page==="home" ? `Good day, ${user?.name} 👋` : Nav.find(n=>n.id===page)?.label || page}
            </h1>
          </div>
          {page==="notes" && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#94a3b8" }}><IconSearch size={14} /></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes…"
                className="rounded-xl pl-8 pr-4 py-2 text-sm outline-none transition w-52"
                style={{ background:"#f8faff", border:"1.5px solid #e2e8f0", color:"#0f172a" }}
                onFocus={onFocus} onBlur={onBlur} />
            </div>
          )}
          <button onClick={() => setNoteM(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 4px 14px rgba(99,102,241,0.30)" }}>
            <IconPlus size={16} /> New Note
          </button>
        </header>

        {/* Pages */}
        <main className="flex-1 overflow-y-auto">

          {/* ── HOME ── */}
          {page==="home" && (
            <div className="fade-up">
              {/* Hero banner */}
              <div className="relative h-52 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&auto=format&fit=crop&q=70"
                  alt="Library" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(99,102,241,0.75), rgba(139,92,246,0.60))" }} />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="text-white/80 text-sm mb-1">You have <span className="font-bold text-white">{notes.length} notes</span> across {subjects.length} subjects</p>
                  <h2 className="text-white text-2xl font-bold">Keep learning, keep growing ✨</h2>
                </div>
              </div>

              <div className="px-6 pt-5 pb-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label:"Notes",    val:notes.length,    icon:IconNote,       color:"#6366f1", bg:"rgba(99,102,241,0.10)" },
                    { label:"Subjects", val:subjects.length, icon:IconFolder,      color:"#06b6d4", bg:"rgba(6,182,212,0.10)" },
                    { label:"Quizzes",  val:"28",            icon:IconHelpCircle, color:"#10b981", bg:"rgba(16,185,129,0.10)" },
                    { label:"Scanned",  val:"6",             icon:IconScan,       color:"#f59e0b", bg:"rgba(245,158,11,0.10)" },
                  ].map(s => (
                    <div key={s.label} className="stat-glow rounded-2xl p-4 flex items-center gap-3 transition card-hover" style={{ ...card, color: s.color }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:s.bg }}>
                        <s.icon size={18} style={{ color:s.color }} />
                      </div>
                      <div>
                        <div className="text-xl font-bold" style={{ color:"#0f172a" }}>{s.val}</div>
                        <div className="text-xs font-medium" style={{ color:"#94a3b8" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color:"#475569" }}>Recent Notes</h2>
                    <button onClick={()=>go("notes")} className="text-xs font-semibold flex items-center gap-1 transition" style={{ color:"#6366f1" }}>
                      View all <IconChevronRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {notes.slice(0,4).map(n => {
                      const s = subjectOf(n);
                      return (
                        <button key={n.id} onClick={()=>{setActiveNote(n); setPage("notedetail");}}
                          className="card-hover rounded-2xl p-4 text-left group transition"
                          style={card}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="pill" style={{ background:s?.bg, color:s?.color, border:`1.5px solid ${s?.border}` }}>{s?.abbr}</span>
                            <span className="text-[11px]" style={{ color:"#94a3b8" }}>{n.date}</span>
                          </div>
                          <div className="text-sm font-semibold mb-1.5 transition group-hover:text-indigo-600" style={{ color:"#0f172a" }}>{n.title}</div>
                          <div className="text-xs leading-relaxed line-clamp-3" style={{ color:"#94a3b8" }}>{n.preview}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subjects strip */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color:"#475569" }}>Your Subjects</h2>
                    <button onClick={()=>go("subjects")} className="text-xs font-semibold flex items-center gap-1" style={{ color:"#6366f1" }}>
                      Manage <IconChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {subjects.map(s => (
                      <div key={s.id} className="relative shrink-0 w-36 h-24 rounded-2xl overflow-hidden cursor-pointer group card-hover">
                        <img src={s.img} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-110 duration-500" />
                        <div className="absolute inset-0" style={{ background:`linear-gradient(to top, ${s.color}CC, ${s.color}44)` }} />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <div className="text-xs font-bold text-white leading-tight drop-shadow">{s.name}</div>
                          <div className="text-[10px] text-white/75">{s.notes} notes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          {page==="notes" && (
            <div className="fade-up p-6">
              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap mb-5">
                {["All", ...subjects.map(s=>s.name)].map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
                    style={noteFilter===f
                      ? { background:"rgba(99,102,241,0.12)", color:"#6366f1", border:"1.5px solid rgba(99,102,241,0.25)" }
                      : { background:"#fff", color:"#64748b", border:"1.5px solid #e2e8f0" }}>
                    {f}
                  </button>
                ))}
              </div>

              {filtNotes.length===0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color:"#cbd5e1" }}>
                  <IconNote size={40} />
                  <p className="text-sm">No notes found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filtNotes.map(n => {
                    const s = subjectOf(n);
                    return (
                      <button key={n.id} onClick={()=>{setActiveNote(n); setPage("notedetail");}}
                        className="card-hover rounded-2xl p-4 text-left group transition"
                        style={card}>
                        {s?.img && (
                          <div className="w-full h-20 rounded-xl overflow-hidden mb-3">
                            <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                          </div>
                        )}
                        <span className="pill mb-2 inline-block" style={{ background:s?.bg, color:s?.color, border:`1.5px solid ${s?.border}` }}>{s?.name}</span>
                        <div className="text-sm font-semibold mb-1 group-hover:text-indigo-600 transition" style={{ color:"#0f172a" }}>{n.title}</div>
                        <div className="text-xs leading-relaxed line-clamp-3" style={{ color:"#94a3b8" }}>{n.preview}</div>
                        <div className="text-[11px] mt-3" style={{ color:"#cbd5e1" }}>{n.date}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── NOTE DETAIL ── */}
          {page==="notedetail" && renderNoteDetail()}

          {/* ── STUDY PLAN ── */}
          {page==="studyplan" && (
            <div className="fade-up p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold" style={{ color:"#0f172a" }}>Study Plan 📅</h2>
                    <p className="text-sm mt-1" style={{ color:"#64748b" }}>A personalised plan based on your subjects and notes.</p>
                  </div>
                  <button onClick={()=>go("notes")} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition"
                    style={{ background:"#fff", border:"1.5px solid #e2e8f0", color:"#64748b" }}>
                    <IconArrowLeft size={16} /> Back to notes
                  </button>
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  {[
                    {
                      title:"This week", icon:IconBolt, color:"#6366f1",
                      content: [
                        <>Review your latest notes on <b style={{color:"#0f172a"}}>{subjects[0]?.name || "Internet Programming"}</b>.</>,
                        <>Complete one quiz for <b style={{color:"#0f172a"}}>{subjects[1]?.name || "Data Structures"}</b>.</>,
                        <>Turn two strong definitions into flashcards for <b style={{color:"#0f172a"}}>{subjects[2]?.name || "Software Engineering"}</b>.</>,
                      ]
                    },
                    {
                      title:"Daily focus", icon:IconTarget, color:"#06b6d4",
                      subjects: subjects.slice(0,3)
                    },
                    {
                      title:"Next goals", icon:IconTrophy, color:"#10b981",
                      goals: [
                        { t:"Create 3 cards", d:"Use flashcards to memorize key terms." },
                        { t:"Practice 1 quiz", d:"Pick a subject with fewer notes." },
                        { t:"Review recent scans", d:"Add uploaded notes to the summary list." },
                      ]
                    },
                  ].map((col, i) => (
                    <div key={i} className="rounded-3xl p-6" style={card}>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${col.color}15` }}>
                          <col.icon size={16} style={{ color:col.color }} />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color:"#475569" }}>{col.title}</div>
                      </div>
                      {col.content && <div className="space-y-3">{col.content.map((c,j) => <p key={j} className="text-sm leading-relaxed" style={{ color:"#64748b" }}>{c}</p>)}</div>}
                      {col.subjects && <div className="space-y-2">{col.subjects.map(s => (
                        <div key={s.id} className="rounded-2xl p-3" style={{ background:"#f8faff", border:"1.5px solid #e2e8f0" }}>
                          <div className="text-sm font-semibold mb-0.5" style={{ color:"#0f172a" }}>{s.name}</div>
                          <div className="text-xs" style={{ color:"#94a3b8" }}>{s.notes} notes · Updated {s.updated}</div>
                        </div>
                      ))}</div>}
                      {col.goals && <div className="space-y-2">{col.goals.map((g,j) => (
                        <div key={j} className="rounded-2xl p-3" style={{ background:"#f8faff", border:"1.5px solid #e2e8f0" }}>
                          <div className="text-sm font-semibold" style={{ color:"#0f172a" }}>{g.t}</div>
                          <div className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>{g.d}</div>
                        </div>
                      ))}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SUBJECTS ── */}
          {page==="subjects" && (
            <div className="fade-up p-6">
              <div className="grid grid-cols-3 gap-4">
                {subjects.map(s => (
                  <div key={s.id} className="card-hover relative rounded-2xl overflow-hidden cursor-pointer group transition"
                    style={{ border:`1.5px solid ${s.border}`, background:"#fff", boxShadow:"0 2px 8px rgba(15,23,42,0.06)" }}>
                    <div className="relative h-36">
                      <img src={s.img} alt={s.name} className="w-full h-full object-cover transition group-hover:scale-105 duration-500" />
                      <div className="absolute inset-0" style={{ background:`linear-gradient(to bottom, transparent, ${s.color}BB)` }} />
                      <div className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        style={{ background:s.color }}>{s.abbr}</div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-bold mb-1" style={{ color:"#0f172a" }}>{s.name}</div>
                      <div className="text-xs mb-3" style={{ color:"#94a3b8" }}>{s.notes} notes · Updated {s.updated}</div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="flex-1 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                          style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>
                          <IconEdit size={11} />Edit
                        </button>
                        <button onClick={()=>setSubjects(subjects.filter(x=>x.id!==s.id))}
                          className="flex-1 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                          style={{ border:"1.5px solid rgba(244,63,94,0.2)", color:"#f43f5e", background:"rgba(244,63,94,0.05)" }}>
                          <IconTrash size={11} />Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setAddSubjM(true)}
                  className="card-hover rounded-2xl flex flex-col items-center justify-center gap-3 h-56 transition"
                  style={{ border:"2px dashed #e2e8f0", color:"#cbd5e1" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(99,102,241,0.35)"; e.currentTarget.style.color="#6366f1"; e.currentTarget.style.background="rgba(99,102,241,0.04)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#cbd5e1"; e.currentTarget.style.background=""; }}>
                  <IconPlus size={28} /><span className="text-sm font-semibold">Add subject</span>
                </button>
              </div>
            </div>
          )}

          {/* ── QUIZ ── */}
          {page==="quiz" && (
            <div className="fade-up p-6">
              {!quizSubjId ? (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 6px 24px rgba(99,102,241,0.30)" }}>
                      <IconHelpCircle size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1" style={{ color:"#0f172a" }}>Pick a subject to quiz</h2>
                    <p className="text-sm" style={{ color:"#64748b" }}>Questions are tailored per subject</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.filter(s => QUIZ_BANK[s.id]).map(s => (
                      <button key={s.id} onClick={()=>{ setQuizSubjId(s.id); setQuizA({}); }}
                        className="card-hover relative rounded-2xl overflow-hidden text-left group transition"
                        style={{ border:`1.5px solid ${s.border}`, background:"#fff" }}>
                        <div className="relative h-20">
                          <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute inset-0" style={{ background:`linear-gradient(to right, ${s.color}55, transparent)` }} />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="pill" style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}` }}>{s.abbr}</span>
                            <span className="text-sm font-semibold group-hover:text-indigo-600 transition" style={{ color:"#0f172a" }}>{s.name}</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color:"#94a3b8" }}>{QUIZ_BANK[s.id]?.length} questions</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={()=>setQuizSubjId(null)} className="flex items-center gap-2 text-sm transition" style={{ color:"#94a3b8" }}>
                      <IconArrowLeft size={16} /> All subjects
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color:"#475569" }}>{quizSubject?.name}</span>
                      <button onClick={()=>setQuizA({})} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition"
                        style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>
                        <IconRefresh size={14} /> Restart
                      </button>
                    </div>
                  </div>

                  {Object.keys(quizA).length === currentQuiz.length && currentQuiz.length > 0 && (
                    <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background:"rgba(99,102,241,0.06)", border:"1.5px solid rgba(99,102,241,0.2)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(99,102,241,0.12)" }}>
                        <IconTrophy size={18} style={{ color:"#6366f1" }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color:"#0f172a" }}>
                          Score: {currentQuiz.filter((q,i)=>quizA[i]===q.ans).length} / {currentQuiz.length}
                        </div>
                        <div className="text-xs" style={{ color:"#64748b" }}>
                          {currentQuiz.filter((q,i)=>quizA[i]===q.ans).length === currentQuiz.length ? "Perfect! 🎉" : "Keep practising!"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {currentQuiz.map((q, qi) => (
                      <div key={qi} className="rounded-2xl p-5" style={card}>
                        <div className="text-sm font-semibold mb-4" style={{ color:"#0f172a" }}>{qi+1}. {q.q}</div>
                        <div className="space-y-2">
                          {q.opts.map((opt, oi) => {
                            const answered = quizA[qi]!==undefined;
                            const selected = quizA[qi]===oi;
                            const correct  = oi===q.ans;
                            let extraStyle = {};
                            if (answered && selected && correct)  extraStyle = { borderColor:"#10b981", background:"rgba(16,185,129,0.07)", color:"#059669", fontWeight:600 };
                            if (answered && selected && !correct) extraStyle = { borderColor:"#f43f5e", background:"rgba(244,63,94,0.07)",  color:"#f43f5e" };
                            if (answered && !selected && correct) extraStyle = { borderColor:"#10b981", background:"rgba(16,185,129,0.07)", color:"#059669", opacity:0.5 };
                            return (
                              <button key={oi} disabled={answered} onClick={()=>setQuizA({...quizA,[qi]:oi})}
                                className="quiz-opt w-full text-left px-4 py-2.5 rounded-xl text-sm"
                                style={{ ...extraStyle, cursor: answered ? "default" : "pointer" }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── FLASHCARDS ── */}
          {page==="flashcards" && (
            <div className="fade-up p-6">
              {!fcSubjId ? (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background:"linear-gradient(135deg, #06b6d4, #6366f1)", boxShadow:"0 6px 24px rgba(6,182,212,0.25)" }}>
                      <IconLayoutGrid size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1" style={{ color:"#0f172a" }}>Pick a subject</h2>
                    <p className="text-sm" style={{ color:"#64748b" }}>Flashcards are grouped per subject · click to flip</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.filter(s => FC_BANK[s.id]).map(s => (
                      <button key={s.id} onClick={()=>{ setFcSubjId(s.id); setFlipped({}); }}
                        className="card-hover relative rounded-2xl overflow-hidden text-left group transition"
                        style={{ border:`1.5px solid ${s.border}`, background:"#fff" }}>
                        <div className="relative h-20">
                          <img src={s.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute inset-0" style={{ background:`linear-gradient(to right, ${s.color}55, transparent)` }} />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="pill" style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}` }}>{s.abbr}</span>
                            <span className="text-sm font-semibold group-hover:text-indigo-600 transition" style={{ color:"#0f172a" }}>{s.name}</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color:"#94a3b8" }}>{FC_BANK[s.id]?.length} cards</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={()=>setFcSubjId(null)} className="flex items-center gap-2 text-sm transition" style={{ color:"#94a3b8" }}>
                      <IconArrowLeft size={16} /> All subjects
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color:"#475569" }}>{subjects.find(s=>s.id===fcSubjId)?.name} · click to flip</span>
                      <button onClick={()=>setFlipped({})} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition"
                        style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>
                        <IconRefresh size={14} /> Reset
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {currentFC.map((fc, i) => (
                      <div key={i} className={`fc-card cursor-pointer ${flipped[i]?"flipped":""}`} onClick={()=>setFlipped({...flipped,[i]:!flipped[i]})}>
                        <div className="fc-inner">
                          <div className="fc-front">
                            <span className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color:"#94a3b8" }}>term</span>
                            <span className="text-lg font-bold" style={{ color:"#0f172a" }}>{fc.term}</span>
                            <span className="text-[10px] mt-3 font-medium" style={{ color:"#cbd5e1" }}>tap to flip</span>
                          </div>
                          <div className="fc-back">
                            <span className="text-[10px] uppercase tracking-widest mb-2 font-semibold text-white/60">definition</span>
                            <span className="text-sm text-white leading-relaxed">{fc.def}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SCAN ── */}
          {page==="scan" && (
            <div className="fade-up p-6 max-w-xl mx-auto">
              <input type="file" accept=".jpg,.jpeg,.png" id="scanFileInput" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setScannedText(`[Processing: ${file.name}]\n\nChapter 4 — Network Protocols\n\nHTTP is the foundation of data communication on the web. HTTPS adds SSL/TLS encryption to protect data in transit.`);
                }} />
              <div
                className="rounded-2xl p-12 text-center mb-4 cursor-pointer transition group"
                style={{ border:"2px dashed #e2e8f0", background:"#f8faff" }}
                onClick={() => document.getElementById('scanFileInput')?.click()}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(6,182,212,0.4)"; e.currentTarget.style.background="rgba(6,182,212,0.04)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#f8faff"; }}>
                <IconScan size={36} style={{ color:"#06b6d4", margin:"0 auto 12px" }} />
                <p className="text-sm mb-1" style={{ color:"#64748b" }}>Drop an image here or <span style={{ color:"#06b6d4", fontWeight:600 }}>click to upload</span></p>
                <p className="text-xs" style={{ color:"#94a3b8" }}>JPG, PNG — max 5MB</p>
                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
                  style={{ background:"rgba(6,182,212,0.10)", color:"#06b6d4", border:"1.5px solid rgba(6,182,212,0.2)" }}
                  onClick={e=>{ e.stopPropagation(); document.getElementById('scanFileInput')?.click(); }}>
                  <IconPlus size={16} /> Upload file
                </button>
              </div>
              <div className="rounded-2xl p-5" style={card}>
                <div className="flex items-center gap-2 text-xs font-semibold mb-3" style={{ color:"#6366f1" }}>
                  <IconSparkles size={14} /> Extracted text
                </div>
                <p className="text-sm leading-relaxed" style={{ color:"#64748b" }}>
                  Chapter 4 — Network Protocols<br /><br />
                  HTTP is the foundation of data communication on the web. HTTPS adds SSL/TLS encryption to protect data in transit.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-xl transition"
                    style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 3px 10px rgba(99,102,241,0.25)" }}
                    onClick={() => setNotes([{ id:Date.now(), sid:0, title:`Scanned: ${scannedText.split('\n')[0]}`, preview:scannedText.slice(0,80), date:"Just now", content:scannedText }, ...notes])}>
                    <IconPlus size={14} /> Save as note
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition"
                    style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>
                    <IconCopy size={14} /> Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DICTIONARY ── */}
          {page==="dictionary" && (
            <div className="fade-up p-6 max-w-xl mx-auto">
              <div className="relative mb-5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"#94a3b8" }}><IconSearch size={16} /></span>
                <input value={dictSearch} onChange={e=>setDictSearch(e.target.value)} placeholder="Look up any word…"
                  className={`${inp} pl-10`} style={inpStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              {[
                { word:"algorithm",   ph:"/ˈælɡərɪðəm/",  pos:"noun", def:"A step-by-step procedure for solving a problem, especially by a computer.", ex:'"Sorting algorithms like quicksort have O(n log n) average complexity."' },
                { word:"abstraction", ph:"/æbˈstrækʃən/", pos:"noun", def:"Hiding complex implementation details, showing only essential features." },
              ].filter(w => w.word.toLowerCase().includes(dictSearch.toLowerCase())).map((w,i) => (
                <div key={i} className="rounded-2xl p-5 mb-3" style={card}>
                  <div className="text-lg font-bold mb-0.5" style={{ color:"#6366f1" }}>{w.word}</div>
                  <div className="text-xs mb-3 font-medium" style={{ color:"#94a3b8" }}>{w.ph} · {w.pos}</div>
                  <div className="text-sm leading-relaxed" style={{ color:"#475569" }}>{w.def}</div>
                  {w.ex && <div className="text-xs italic mt-2 pl-3" style={{ color:"#94a3b8", borderLeft:"2px solid #e2e8f0" }}>{w.ex}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── CHAT ── */}
          {page==="chat" && (
            <div className="fade-up p-6 max-w-2xl mx-auto flex flex-col h-full">
              {/* Header card */}
              <div className="rounded-2xl p-5 mb-5 flex items-center gap-3"
                style={{ background:"linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))", border:"1.5px solid rgba(99,102,241,0.15)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                  style={{ background:"linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow:"0 4px 16px rgba(99,102,241,0.25)" }}>
                  <IconMessageCircle size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color:"#0f172a" }}>LearnIt Tutor</div>
                  <div className="text-xs" style={{ color:"#64748b" }}>Your AI study assistant · always here to help</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 rounded-2xl p-5 flex flex-col gap-3" style={{ ...card, minHeight:"300px" }}>
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background:"rgba(99,102,241,0.08)" }}>
                        <IconMessageCircle size={28} style={{ color:"#6366f1" }} />
                      </div>
                      <p className="font-semibold mb-1" style={{ color:"#0f172a" }}>Start a conversation!</p>
                      <p className="text-xs" style={{ color:"#94a3b8" }}>Ask about notes, quizzes, flashcards, or study tips</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-3 text-sm leading-relaxed ${m.role==="user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input bar */}
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png,.txt" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
                  style={{ background:"#f8faff", border:"1.5px solid #e2e8f0", color:"#6366f1" }}>
                  <IconPlus size={18} />
                </button>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendChatMessage()}
                  placeholder="Type your message…"
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{ background:"#f8faff", border:"1.5px solid #e2e8f0", color:"#0f172a" }}
                  onFocus={onFocus} onBlur={onBlur} />
                <button onClick={sendChatMessage} disabled={!chatInput.trim()}
                  className="px-5 h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition"
                  style={{ background: chatInput.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0", color: chatInput.trim() ? "#fff" : "#94a3b8", boxShadow: chatInput.trim() ? "0 4px 14px rgba(99,102,241,0.30)" : "none", cursor: chatInput.trim() ? "pointer" : "not-allowed" }}>
                  <IconSend size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ ADD SUBJECT MODAL ══ */}
      {addSubjM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(8px)" }}>
          <div className="glass-strong rounded-3xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold mb-4" style={{ color:"#0f172a" }}>Add New Subject</h3>
            <input autoFocus value={newSubj} onChange={e=>setNewSubj(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubject()}
              placeholder="e.g. Computer Science"
              className={`${inp} mb-4`} style={inpStyle} onFocus={onFocus} onBlur={onBlur} />
            <div className="flex gap-2">
              <button onClick={()=>{setAddSubjM(false);setNewSubj("");}}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>Cancel</button>
              <button onClick={addSubject}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 4px 14px rgba(99,102,241,0.25)" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ NEW NOTE MODAL ══ */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(8px)" }}>
          <div className="glass-strong rounded-3xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color:"#0f172a" }}>New Note ✏️</h3>
              <button onClick={()=>setNoteM(false)} className="transition p-1 rounded-lg"
                style={{ color:"#94a3b8" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(244,63,94,0.08)"; e.currentTarget.style.color="#f43f5e"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=""; e.currentTarget.style.color="#94a3b8"; }}>
                <IconX size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <select value={newNote.subject} onChange={e=>setNewNote({...newNote,subject:e.target.value})}
                className={inp} style={{ ...inpStyle, color: newNote.subject ? "#0f172a" : "#94a3b8" }}>
                <option value="">Select subject…</option>
                {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <input value={newNote.title} onChange={e=>setNewNote({...newNote,title:e.target.value})} placeholder="Note title…"
                className={inp} style={inpStyle} onFocus={onFocus} onBlur={onBlur} />
              <textarea value={newNote.content} onChange={e=>setNewNote({...newNote,content:e.target.value})} placeholder="Start writing…" rows={5}
                className={inp + " resize-none"} style={inpStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setNoteM(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ border:"1.5px solid #e2e8f0", color:"#64748b" }}>Cancel</button>
              <button onClick={saveNote}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                style={{ background:"linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow:"0 4px 14px rgba(99,102,241,0.25)" }}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
