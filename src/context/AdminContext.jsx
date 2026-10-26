import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        open,
        openAdmin: () => setOpen(true),
        closeAdmin: () => setOpen(false),
        session,
        signOut: () => supabase.auth.signOut(),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
};