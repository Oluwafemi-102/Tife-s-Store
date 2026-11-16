import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setItems(data);
  }, [userId]);

  useEffect(() => {
    setItems([]);
    if (!userId) return;

    load();
    const poll = setInterval(load, 60000); // backup in case live updates are off
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setItems((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = useCallback(async (ids) => {
    if (!ids.length) return;
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  }, []);

  const remove = useCallback(async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    await supabase.from("notifications").delete().eq("user_id", userId);
  }, [userId]);

  return (
    <NotificationsContext.Provider
      value={{ items, unread, load, markRead, remove, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
};