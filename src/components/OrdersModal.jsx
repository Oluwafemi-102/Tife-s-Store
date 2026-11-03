import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import { formatPrice } from "../utils/formatPrice";
import { STATUS } from "../utils/orderStatus";
import { WHATSAPP_NUMBER } from "../config";

const OrdersModal = () => {
  const { isOpen, closeOrders } = useOrders();
  const { user, ready, openAuth } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the customer's orders every time the modal opens
  useEffect(() => {
    if (!isOpen || !ready || !user) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      const { data, error: dbError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (dbError) setError("We couldn't load your orders. Please try again.");
      else setOrders(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, ready, user?.id]);

  // Close with Escape, and block the page behind from scrolling
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && closeOrders();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, closeOrders]);

  if (!isOpen) return null;

  const showLoading = !ready || (user && loading);

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      {/* Backdrop: covers the whole screen, so nothing behind can be clicked */}
      <div
        onClick={closeOrders}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="My orders"
        className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white text-neutral-900 shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-xl font-bold">My orders</h2>
          <button
            onClick={closeOrders}
            aria-label="Close"
            className="h-9 w-9 rounded-full text-2xl leading-none hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          {showLoading ? (
            <p className="py-10 text-center text-neutral-500">Loading your orders...</p>
          ) : !user ? (
            <div className="py-8 text-center">
              <p className="text-neutral-600">Sign in to see your orders.</p>
              <button
                onClick={() => {
                  openAuth("signin", "Sign in to see your orders.");
                }}
                className="mt-5 rounded-full bg-neutral-900 px-7 py-3 font-semibold text-white transition hover:bg-neutral-700"
              >
                Sign in
              </button>
            </div>
          ) : error ? (
            <p className="py-10 text-center text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-semibold">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate("/products", { replace: true })}
                className="mt-4 rounded-full bg-neutral-900 px-6 py-2.5 font-semibold text-white transition hover:bg-neutral-700"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => {
                const status = STATUS[order.status] ?? STATUS.pending;
                const chat = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello! I'm asking about my order ${order.ref}.`
                )}`;

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-neutral-200 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">{order.ref}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <ul className="mt-4 grid gap-3">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-xl bg-neutral-100 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="text-xs text-neutral-500">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {order.note && (
                      <p className="mt-4 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                        Note: {order.note}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
                      <p className="text-lg">
                        Total{" "}
                        <span className="font-bold">
                          {formatPrice(Number(order.total))}
                        </span>
                      </p>
                      <a
                        href={chat}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        💬 Chat about this order
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;