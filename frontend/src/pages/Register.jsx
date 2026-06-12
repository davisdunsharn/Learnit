import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconBook2, IconAlertCircle, IconCircleCheck, IconUser, IconMail,
  IconLock, IconLockCheck, IconLoader2, IconEye, IconEyeOff,
  IconCheck, IconPoint, IconX, IconSparkles
} from "@tabler/icons-react";

const rules = [
  { label: "8+ characters",             test: p => p.length >= 8 },
  { label: "Uppercase letter",          test: p => /[A-Z]/.test(p) },
  { label: "Lowercase letter",          test: p => /[a-z]/.test(p) },
  { label: "Number",                    test: p => /[0-9]/.test(p) },
  { label: "Special character (!@#$…)", test: p => /[^A-Za-z0-9]/.test(p) },
];

const sc = [null,
  { label:"Weak",   color:"#f43f5e", w:"20%" },
  { label:"Weak",   color:"#f43f5e", w:"40%" },
  { label:"Fair",   color:"#f59e0b", w:"60%" },
  { label:"Good",   color:"#06b6d4", w:"80%" },
  { label:"Strong", color:"#10b981", w:"100%" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [error, setError]   = useState("");
  const [loading, setLoad]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const passed = rules.filter(r => r.test(form.password)).length;
  const strength = sc[passed];

  const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const submit = async e => {
    e.preventDefault();
    if (passed < 5) return setError("Please meet all password requirements.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoad(true);
    setTimeout(async () => {
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      setLoad(false);
      if (!res.ok) return setError(res.error);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    }, 600);
  };

  const inputBase = {
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    color: "#0f172a",
    boxShadow: "0 1px 4px rgba(15,23,42,0.06)"
  };

  const onFocus = e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; };
  const onBlur  = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; };

  return (
    <div className="min-h-screen flex bg-mesh">
      {/* LEFT — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80"
          alt="Students collaborating"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.80) 0%, rgba(99,102,241,0.70) 60%, rgba(139,92,246,0.55) 100%)" }} />

        {/* Decorative */}
        <div className="absolute top-16 right-16 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
        <div className="absolute bottom-40 right-8 w-12 h-12 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-lg">
              <IconBook2 size={20} className="text-white" />
            </div>
            <span className="syne text-2xl font-bold tracking-tight">LearnIt</span>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-white/90 mb-5">
              <IconSparkles size={12} /> Free forever
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-4">Join thousands<br />of learners.</h2>
            <p className="text-white/75 text-lg leading-relaxed">Your AI study companion starts here.<br />No credit card needed.</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <IconBook2 size={18} className="text-white" />
            </div>
            <span className="syne text-xl font-bold" style={{ color: "#0f172a" }}>LearnIt</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#0f172a" }}>Create your account ✨</h1>
            <p className="text-sm" style={{ color: "#64748b" }}>Free forever. No credit card needed.</p>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 8px 30px rgba(16,185,129,0.3)" }}>
                <IconCircleCheck size={36} className="text-white" />
              </div>
              <p className="font-bold text-xl mb-1" style={{ color: "#0f172a" }}>You're in! 🎉</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm mb-5 font-medium" style={{ background: "rgba(244,63,94,0.08)", border: "1.5px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
                  <IconAlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Full name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}><IconUser size={16} /></span>
                    <input name="name" type="text" required value={form.name} onChange={handle} placeholder="Jane Smith"
                      className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition"
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}><IconMail size={16} /></span>
                    <input name="email" type="email" required value={form.email} onChange={handle} placeholder="you@example.com"
                      className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition"
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}><IconLock size={16} /></span>
                    <input name="password" type={showPw ? "text" : "password"} required value={form.password} onChange={handle} placeholder="Strong password"
                      className="w-full rounded-2xl pl-10 pr-10 py-3 text-sm outline-none transition"
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "#94a3b8" }}>
                      {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden mr-3" style={{ background: "#f1f5f9" }}>
                          <div className="strength-bar h-full rounded-full" style={{ width: strength?.w||"0%", background: strength?.color||"transparent" }} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: strength?.color||"transparent" }}>{strength?.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {rules.map((r,i) => (
                          <div key={i} className={`flex items-center gap-1.5 text-[11px] font-medium ${r.test(form.password) ? "" : ""}`} style={{ color: r.test(form.password) ? "#10b981" : "#94a3b8" }}>
                            {r.test(form.password) ? <IconCheck size={10} /> : <IconPoint size={10} />}{r.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#64748b" }}>Confirm password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}><IconLockCheck size={16} /></span>
                    <input name="confirm" type={showCf ? "text" : "password"} required value={form.confirm} onChange={handle} placeholder="••••••••"
                      className="w-full rounded-2xl pl-10 pr-10 py-3 text-sm outline-none transition"
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "#94a3b8" }}>
                      {showCf ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {form.confirm.length > 0 && (
                    <p className="mt-1.5 text-[11px] flex items-center gap-1 font-medium" style={{ color: form.password === form.confirm ? "#10b981" : "#f43f5e" }}>
                      {form.password === form.confirm ? <IconCheck size={10} /> : <IconX size={10} />}
                      {form.password === form.confirm ? "Passwords match ✓" : "Passwords don't match"}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-2xl py-3.5 transition mt-2"
                  style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? <><IconLoader2 size={16} className="animate-spin" /> Creating account…</> : "Create account →"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm mt-8" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold transition" style={{ color: "#6366f1" }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
