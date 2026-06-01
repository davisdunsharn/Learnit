import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);

const USERS_KEY = "learnit_users";
const SESSION_KEY = "learnit_session";

const getUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; } };
const saveUsers = u => localStorage.setItem(USERS_KEY, JSON.stringify(u));

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try { const s = localStorage.getItem(SESSION_KEY); if (s) setUser(JSON.parse(s)); } catch {}
    setLoading(false);
  }, []);

  const register = (name, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: "An account with this email already exists." };
    saveUsers([...users, { id: Date.now(), name, email: email.toLowerCase(), password }]);
    return { ok: true };
  };

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: "Incorrect email or password." };
    const { password: _, ...safe } = found;
    setUser(safe);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return { ok: true };
  };

  const logout = () => { setUser(null); localStorage.removeItem(SESSION_KEY); };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
