import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import { STATUS } from "../utils/orderStatus";
import { WHATSAPP_NUMBER } from "../config";

const Shell = ({ children }) => (
  <section className="min-h-screen bg-neutral-900 text-white">
    <div className="mx-auto max-w-3xl px-6 pt-44 pb-12">{children}</div>
  </section>
);

const OrdersPage = () => {
  const { user, ready, openAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
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
  }, [ready, user?.id]);

  if (!ready || (user && loading)) {
    return (
      <Shell>
        <p className="py-16 text-center opacity-80">Loading your orders...</p>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="rounded-3xl bg-white text-neutral-900 p-8 text-center">
          <h1 className="text-2xl font-bold">My orders</h1>
          <p className="mt-2 text-neutral-600">Sign in to see your orders.</p>
          <button
            onClick={() => openAuth("signin", "Sign in to see your orders.")}
            className="mt-5 rounded-full bg-neutral-900 text-white px-7 py-3 font-semibold hover:bg-neutral-700 transition"
          >
            Sign in
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-3xl font-bold">My orders</h1>

      {error && <p className="mt-6 text-red-300">{error}</p>}

      {!error && orders.length === 0 && (
        <div className="mt-8 rounded-3xl bg-white text-neutral-900 p-8 text-center">
          <p className="font-semibold">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-full bg-neutral-900 text-white px-6 py-2.5 font-semibold hover:bg-neutral-700 transition"
          >
            Start shopping
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-5">
        {orders.map((order) => {
          const status = STATUS[order.status] ?? STATUS.pending;
          const chat = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Hello! I'm asking about my order ${order.ref}.`
          )}`;

          return (
            <article
              key={order.id}
              className="rounded-3xl bg-white text-neutral-900 p-5 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{order.ref}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}>
                  {status.label}
                </span>
              </div>

              <ul className="mt-4 grid gap-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
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
                  Total <span className="font-bold">{formatPrice(Number(order.total))}</span>
                </p>
                <a
                  href={chat}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-green-600 text-white px-5 py-2 text-sm font-semibold hover:bg-green-700 transition"
                >
                  💬 Chat about this order
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </Shell>
  );
};

export default OrdersPage;