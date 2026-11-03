import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/formatPrice";
import { STATUS } from "../../utils/orderStatus";

const FILTERS = ["all", ...Object.keys(STATUS)];

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    if (error) {
      alert(error.message);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    }
  };

  const countFor = (key) =>
    key === "all" ? orders.length : orders.filter((o) => o.status === key).length;

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  return (
    <div className="grid gap-3">
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === key
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-300"
            }`}
          >
            {key === "all" ? "All" : STATUS[key].label} ({countFor(key)})
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-6">No orders here.</p>
      )}

      {visible.map((o) => (
        <div key={o.id} className="rounded-2xl border border-neutral-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">{o.ref}</p>
              <p className="text-xs text-neutral-500">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <select
              value={o.status}
              onChange={(e) => setStatus(o, e.target.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border-0 ${STATUS[o.status]?.style ?? ""}`}
            >
              {Object.entries(STATUS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-2 text-sm">
            <span className="font-semibold">{o.customer_name}</span>
            {o.customer_email && (
              <>
                {" · "}
                <a href={`mailto:${o.customer_email}`} className="underline underline-offset-2">
                  {o.customer_email}
                </a>
              </>
            )}
          </p>

          <ul className="mt-2 grid gap-1 text-sm text-neutral-700">
            {o.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="truncate">
                  {item.quantity} x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          {o.note && (
            <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Note: {o.note}
            </p>
          )}

          <p className="mt-2 text-right font-bold">
            Total {formatPrice(Number(o.total))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OrdersManager;