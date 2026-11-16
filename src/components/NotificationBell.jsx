import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";

const ICONS = { welcome: "👋", order: "📦", promo: "🏷️", new_products: "🛍️", review: "⭐", admin: "📣" };

const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationBell = ({ buttonClass = "" }) => {
  const { user } = useAuth();
  const { openOrders } = useOrders();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setItems(data);
  }, []);

  // Load now, then re-check every minute (backup in case live updates are off)
  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load, user?.id]);

  // New notifications appear instantly
  useEffect(() => {
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setItems((prev) => [payload.new, ...prev])
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (ids) => {
    if (!ids.length) return;
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  };

  const remove = async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const clearAll = async () => {
    setItems([]);
    await supabase.from("notifications").delete().eq("user_id", user.id);
  };

  const openItem = (n) => {
    if (!n.read) markRead([n.id]);
    setOpen(false);
    if (!n.link) return;
    if (n.link.startsWith("http")) window.open(n.link, "_blank", "noopener");
    else if (n.link === "/orders") openOrders();
    else navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          load();
        }}
        className={buttonClass}
      >
        <IoIosNotificationsOutline className="text-2xl" />
        Alerts
      </button>

      {unread > 0 && (
        <span className="pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-xs text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[92vw] overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <p className="font-bold">Notifications</p>
            <div className="flex gap-3 text-xs">
              {unread > 0 && (
                <button
                  onClick={() => markRead(items.filter((n) => !n.read).map((n) => n.id))}
                  className="font-semibold text-pink-600"
                >
                  Mark all read
                </button>
              )}
              {items.length > 0 && (
                <button onClick={clearAll} className="text-neutral-500 hover:text-red-600">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-500">
                You are all caught up. 🎉
              </p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`group flex gap-3 border-b border-neutral-100 px-4 py-3 ${
                    n.read ? "" : "bg-pink-50"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg">
                    {ICONS[n.type] ?? "🔔"}
                  </span>

                  <button onClick={() => openItem(n)} className="min-w-0 flex-1 text-left">
                    <p className={`text-sm ${n.read ? "font-medium" : "font-bold"}`}>{n.title}</p>
                    <p className="mt-0.5 line-clamp-3 text-xs text-neutral-600">{n.body}</p>
                    <p className="mt-1 text-[11px] text-neutral-400">{timeAgo(n.created_at)}</p>
                  </button>

                  <div className="flex flex-col items-center gap-1">
                    {!n.read && <span className="h-2 w-2 rounded-full bg-pink-600" />}
                    <button
                      onClick={() => remove(n.id)}
                      aria-label="Delete notification"
                      className="text-lg leading-none text-neutral-300 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;