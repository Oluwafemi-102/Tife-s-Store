import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { TEMPLATE_GROUPS } from "../../utils/notificationTemplates";
import { CATEGORIES } from "../../utils/categories";
import { useFeedback } from "../../context/FeedbackContext";

const input = "border border-neutral-300 rounded-lg px-3 py-3 w-full";

const TYPES = [
  ["promo", "Sale / promotion"],
  ["new_products", "New arrivals"],
  ["order", "Order / service"],
  ["admin", "Announcement"],
];

const LINKS = [
  ["", "No link"],
  ["/products", "Shop all products"],
  ...CATEGORIES.map((c) => [`/products?category=${c}`, `${c} products`]),
  ["/orders", "My orders"],
];

const NotificationsManager = () => {
  const [audience, setAudience] = useState("all");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("admin");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast, confirm } = useFeedback();


  const applyTemplate = (t) => {
  setType(t.type);
  setTitle(t.title);
  setBody(t.body);
  setLink(t.link);
};

  const send = async (e) => {
  e.preventDefault();
  if (!title.trim() || !body.trim()) {
    return toast.error("Please add a title and a message.");
  }
  if (audience === "one" && !email.trim()) {
    return toast.error("Please enter the customer's email.");
  }

  const everyone = audience === "all";
  const ok = await confirm({
    title: everyone ? "Send to all customers?" : "Send to this customer?",
    message: everyone
      ? `"${title.trim()}" will appear in every customer's notifications.`
      : `"${title.trim()}" will be sent to ${email.trim()}.`,
    confirmText: "Send now",
  });
  if (!ok) return;

  setBusy(true);
  const { data, error } = await supabase.rpc("send_notification", {
    p_title: title.trim(),
    p_body: body.trim(),
    p_type: type,
    p_link: link || null,
    p_email: everyone ? null : email.trim(),
  });
  setBusy(false);

  if (error) toast.error(error.message);
  else if (!data) toast.error("No matching customer found. Check the email address.");
  else toast.success(`Notification sent to ${data} customer${data === 1 ? "" : "s"} ✅`);
};

  return (
    <div className="grid gap-5">
      <div>
        <p className="font-semibold">1. Pick a ready-made message (or write your own)</p>
        {TEMPLATE_GROUPS.map((g) => (
          <div key={g.group} className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{g.group}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {g.items.map((t) => (
                <button
                  type="button"
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    title === t.title ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="grid gap-3">
        <p className="font-semibold">2. Check and send</p>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={audience === "all"} onChange={() => setAudience("all")} />
            All customers
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={audience === "one"} onChange={() => setAudience("one")} />
            One customer
          </label>
        </div>

        {audience === "one" && (
          <input className={input} type="email" placeholder="Customer's email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}

        <input className={input} placeholder="Title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={input} rows={4} placeholder="Message" value={body} maxLength={500} onChange={(e) => setBody(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select className={input} value={link} onChange={(e) => setLink(e.target.value)}>
            {LINKS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        

        <button disabled={busy} className="rounded-full bg-neutral-900 text-white py-3 font-semibold disabled:opacity-50">
          {busy ? "Sending..." : "Send notification"}
        </button>
      </form>
    </div>
  );
};

export default NotificationsManager;