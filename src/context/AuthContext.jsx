import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) setAuthOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"
    : "";

  return (
    <AuthContext.Provider
      value={{
        user,
        displayName,
        authOpen,
        authMode,
        authMessage,
        openAuth: (mode = "signin", message = "") => {
  setAuthMode(mode);
  setAuthMessage(message);
  setAuthOpen(true);
},
        closeAuth: () => setAuthOpen(false),
        signOut: () => supabase.auth.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};