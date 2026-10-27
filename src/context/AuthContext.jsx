import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"
    : "";

  // Opens the standalone page, and remembers where to come back to
  const openAuth = (mode = "signin", message = "") =>
    navigate("/auth", {
      state: { mode, message, from: location.pathname + location.search },
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        displayName,
        openAuth,
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