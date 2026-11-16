import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrdersContext";
import { useNotifications } from "../context/NotificationsContext";

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

const NotificationList = ({ onDone }) => {
  const { items, markRead, remove } = useNotifications();
  const { openOrders } = useOrders();
  const navigate = useNavigate();

  const openItem = (n) => {
    if (!n.read) markRead([n.id]);
    onDone?.();
    if (!n.link) return;
    if (n.link.startsWith("http")) window.open(n.link, "_blank", "noopener");
    else if (n.link === "/orders") openOrders();
    else navigate(n.link);
  };

  if (items.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-neutral-500">
        You are all caught up. 🎉
      </p>
    );
  }

  return (
    <div>
      {items.map((n) => (
        <div
          key={n.id}
          className={`flex gap-3 border-b border-neutral-100 px-4 py-3 ${n.read ? "" : "bg-pink-50"}`}
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
      ))}
    </div>
  );
};

export default NotificationList;