import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconBook2, IconAlertCircle, IconMail, IconLock, IconLoader2, IconEye, IconEyeOff, IconSparkles, IconBolt } from "@tabler/icons-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]    = useState({ email:"", password:"" });
  const [error, setError]  = useState("");
  const [loading, setLoad] = useState(false);
  const [showPw, setShowPw]= useState(false);

  const getIcon = (iconName, props = {}) => {
    const icons = {
      "book-2": IconBook2,
      "alert-circle": IconAlertCircle,
      mail: IconMail,
      lock: IconLock,
      "loader-2": IconLoader2,
      eye: IconEye,
      "eye-off": IconEyeOff,
      sparkles: IconSparkles,
      bolt: IconBolt,
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={16} {...props} /> : null;
  };

  const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoad(true);
    setTimeout(async () => {
      const res = await login(form.email.trim(), form.password);
      setLoad(false);
      if (!res.ok) return setError(res.error);
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-mesh">
      {/* LEFT — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&auto=format&fit=crop&q=80"
          alt="Student studying"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlay — bright indigo/violet tint */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(139,92,246,0.70) 60%, rgba(6,182,212,0.50) 100%)" }} />

        {/* Decorative circles */}
        <div className="absolute top-12 right-12 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
        <div className="absolute bottom-32 right-24 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-lg">
              <IconBook2 size={20} className="text-white" />
            </div>
            <span className="syne text-2xl font-bold text-white tracking-tight">LearnIt</span>
          </div>

          {/* Bottom content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-white/90 mb-5">
              <IconSparkles size={12} /> AI-Powered Learning
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-4">Study smarter,<br />not harder.</h2>
            <p className="text-white/75 text-lg mb-8 leading-relaxed">AI-powered notes, quizzes, and flashcards —<br />all in one brilliant place.</p>
            <div className="flex gap-8">
              {[["12K+","Students"],["98%","Pass rate"],["50+","Subjects"]].map(([v,l]) => (
                <div key={l} className="text-center">
                  <div className="text-3xl font-bold text-white">{v}</div>
                  <div className="text-white/55 text-sm mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <IconBook2 size={18} className="text-white" />
            </div>
            <span className="syne text-xl font-bold" style={{ color: "#0f172a" }}>LearnIt</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#0f172a" }}>Welcome back 👋</h1>
            <p className="text-sm" style={{ color: "#64748b" }}>Sign in to continue your learning journey</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm mb-5 font-medium" style={{ background: "rgba(244,63,94,0.08)", border: "1.5px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              <IconAlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}>
                  <IconMail size={16} />
                </span>
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition"
                  style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}>
                  <IconLock size={16} />
                </span>
                <input
                  name="password" type={showPw ? "text" : "password"} required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="w-full rounded-2xl pl-10 pr-10 py-3 text-sm outline-none transition"
                  style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "#94a3b8" }}>
                  {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <a href="#" className="text-xs font-medium transition" style={{ color: "#6366f1" }}>Forgot password?</a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-2xl py-3.5 transition mt-2"
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? <><IconLoader2 size={16} className="animate-spin" /> Signing in…</> : "Sign in →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
            <span className="text-xs" style={{ color: "#94a3b8" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "#64748b" }}>
            No account?{" "}
            <Link to="/register" className="font-semibold transition" style={{ color: "#6366f1" }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
