import { useEffect, useRef, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useNotifications } from "../context/NotificationsContext";
import NotificationList from "./NotificationList";

const NotificationBell = ({ buttonClass = "" }) => {
  const { items, unread, load, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
            <NotificationList onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;