import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdOutlineCategory,
  MdOutlineHome,
  MdOutlineShoppingCart,
  MdSearch,
} from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useNotifications } from "../context/NotificationsContext";
import { NAV_CATEGORIES, categoryPath } from "../utils/navCategories";
import { SUPPORT_EMAIL, WHATSAPP_NUMBER } from "../config";
import NotificationList from "./NotificationList";
import MyReviews from "./MyReviews";

const NAV_HEIGHT = "calc(4rem + env(safe-area-inset-bottom))";
const ACCOUNT_VIEWS = ["account", "inbox", "reviews", "help"];
const TITLES = {
  categories: "Categories",
  account: "Account",
  inbox: "Inbox",
  reviews: "Ratings & reviews",
  help: "Help & support",
};

/* ---------- Top bar: brand + search ---------- */
export const MobileTopBar = ({ query, setQuery, onSearch }) => (
  <div className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 px-3 pb-3 pt-2 text-white backdrop-blur">
    <Link to="/" className="satisfy-regular block text-2xl leading-none">
      Slay With Tife
    </Link>
    <form onSubmit={onSearch} role="search" className="relative mt-2">
      <MdSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-neutral-400"
      />
      <input
        type="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products..."
        aria-label="Search products"
        className="w-full rounded-full border-none bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500/50"
      />
    </form>
  </div>
);

/* ---------- Small building blocks ---------- */
const Row = ({ icon, label, onClick, badge = 0, danger = false }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-4 px-4 py-4 text-left ${danger ? "text-red-600" : ""}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="flex-1 font-medium">{label}</span>
    {badge > 0 && (
      <span className="rounded-full bg-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
    {!danger && <span className="text-neutral-400">›</span>}
  </button>
);

const InboxView = ({ onDone }) => {
  const { items, unread, markRead, clearAll } = useNotifications();
  return (
    <div>
      {items.length > 0 && (
        <div className="flex justify-end gap-4 px-4 py-2 text-xs">
          {unread > 0 && (
            <button
              onClick={() => markRead(items.filter((n) => !n.read).map((n) => n.id))}
              className="font-semibold text-pink-600"
            >
              Mark all read
            </button>
          )}
          <button onClick={clearAll} className="text-neutral-500">
            Clear all
          </button>
        </div>
      )}
      <div className="bg-white">
        <NotificationList onDone={onDone} />
      </div>
    </div>
  );
};

/* ---------- Bottom bar + full-screen menus ---------- */
const MobileNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, displayName, openAuth, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const { openOrders } = useOrders();
  const { unread } = useNotifications();
  const [sheet, setSheet] = useState(null);

  const close = () => setSheet(null);
  const go = (path) => {
    close();
    navigate(path);
  };

  // Close the menu whenever the page changes
  useEffect(() => {
    setSheet(null);
  }, [pathname]);

  // Stop the page behind a menu from scrolling
  useEffect(() => {
    if (!sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheet]);

  const inAccount = ACCOUNT_VIEWS.includes(sheet);

  const tabs = [
    {
      key: "home",
      label: "Home",
      Icon: MdOutlineHome,
      active: pathname === "/" && !sheet,
      onClick: () => {
        close();
        if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
        else navigate("/");
      },
    },
    {
      key: "categories",
      label: "Categories",
      Icon: MdOutlineCategory,
      active: sheet === "categories",
      onClick: () => setSheet(sheet === "categories" ? null : "categories"),
    },
    {
      key: "cart",
      label: "Cart",
      Icon: MdOutlineShoppingCart,
      badge: totalItems,
      onClick: () => {
        close();
        openCart();
      },
    },
    {
      key: "account",
      label: "Account",
      Icon: FaRegUser,
      badge: unread,
      active: inAccount,
      onClick: () => setSheet(inAccount ? null : "account"),
    },
  ];

  return (
    <>
      <style>{`@keyframes sheetUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Full-screen menu */}
      {sheet && (
        <div
          className="fixed inset-x-0 top-0 z-[55] flex flex-col bg-neutral-100 text-neutral-900"
          style={{ bottom: NAV_HEIGHT, animation: "sheetUp .25s ease" }}
        >
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-3 text-white">
            {(sheet === "inbox" || sheet === "reviews" || sheet === "help") && (
              <button
                onClick={() => setSheet("account")}
                aria-label="Back"
                className="h-9 w-9 rounded-full text-xl hover:bg-white/10"
              >
                ←
              </button>
            )}
            <h2 className="flex-1 pl-1 text-lg font-bold">{TITLES[sheet]}</h2>
            <button
              onClick={close}
              aria-label="Close"
              className="h-9 w-9 rounded-full text-2xl leading-none hover:bg-white/10"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sheet === "categories" && (
              <div className="grid grid-cols-2 gap-3 p-4">
                {NAV_CATEGORIES.map(({ label, Icon, category }) => (
                  <button
                    key={label}
                    onClick={() => go(categoryPath(category))}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm active:scale-[.98]"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-3xl text-pink-600">
                      <Icon />
                    </span>
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {sheet === "account" && (
              <div>
                {user ? (
                  <div className="flex items-center gap-3 bg-white p-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-fuchsia-600 text-lg font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{displayName}</p>
                      <p className="truncate text-sm text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-5 text-center">
                    <p className="font-bold">Welcome to Slay With Tife</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Sign in to shop, track orders and get updates.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          close();
                          openAuth("signin");
                        }}
                        className="rounded-full bg-neutral-900 py-2.5 font-semibold text-white"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          close();
                          openAuth("signup");
                        }}
                        className="rounded-full border border-neutral-300 py-2.5 font-semibold"
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-2 divide-y divide-neutral-100 bg-white">
                  <Row
                    icon="📦"
                    label="My orders"
                    onClick={() => {
                      close();
                      openOrders();
                    }}
                  />
                  {user && (
                    <Row icon="🔔" label="Inbox" badge={unread} onClick={() => setSheet("inbox")} />
                  )}
                  {user && (
                    <Row icon="⭐" label="Ratings & reviews" onClick={() => setSheet("reviews")} />
                  )}
                  <Row icon="💬" label="Help & support" onClick={() => setSheet("help")} />
                  {user && (
                    <Row
                      icon="🚪"
                      label="Sign out"
                      danger
                      onClick={() => {
                        signOut();
                        close();
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {sheet === "inbox" && <InboxView onDone={close} />}

            {sheet === "reviews" && user && (
              <MyReviews onOpenProduct={(id) => go(`/products/${id}`)} />
            )}

            {sheet === "help" && (
              <div className="mt-2 divide-y divide-neutral-100 bg-white">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <span className="text-xl">💬</span>
                  <span className="flex-1 font-medium">Chat with us on WhatsApp</span>
                  <span className="text-neutral-400">›</span>
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <span className="text-xl">✉️</span>
                  <span className="flex-1 font-medium">Email us</span>
                  <span className="text-neutral-400">›</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-neutral-950/95 text-white backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-4">
          {tabs.map(({ key, label, Icon, active, badge, onClick }) => (
            <li key={key}>
              <button
                onClick={onClick}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                  active ? "text-pink-400" : "text-neutral-300"
                }`}
              >
                <span className="relative">
                  <Icon className="text-2xl" />
                  {badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileNav;