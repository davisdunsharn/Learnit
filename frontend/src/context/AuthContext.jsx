import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check if there's already a session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) return { ok: false, error: error.message };

  if (data.user) {
    const { error: insertError } = await supabase.from("users").insert([{
      id: data.user.id,
      name,
      email
      // no password column — Supabase Auth handles that
    }]);

    if (insertError) console.error("Failed to insert user profile:", insertError.message);
  }

  return { ok: true };
};
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Incorrect email or password." };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // helper so components can get the user's display name
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Student";

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, userName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
