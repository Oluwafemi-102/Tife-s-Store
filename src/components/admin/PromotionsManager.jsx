import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { uploadFile } from "../../lib/uploadFile";
import { useStoreData } from "../../context/StoreDataContext";
import { PromoCard } from "../PromoBanner";
import { PROMO_FONTS, PROMO_STYLES } from "../../utils/promoStyles";
import { CATEGORIES } from "../../utils/categories";
import { useFeedback } from "../../context/FeedbackContext";

const input = "border border-neutral-300 rounded-lg px-3 py-3 w-full";
const labelClass = "text-sm text-neutral-600";

const toLocalInput = (iso) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const blank = () => ({
  title: "",
  subtitle: "",
  badge: "",
  discount_percent: "",
  category: "",
  style: "ember",
  font: "abril",
  image: "",
  cta: "Shop the sale",
  link: "/products",
  starts_at: toLocalInput(new Date().toISOString()),
  ends_at: toLocalInput(new Date(Date.now() + 7 * 86400000).toISOString()),
  active: true,
});

const statusOf = (p) => {
  const now = Date.now();
  if (!p.active) return ["Off", "bg-neutral-200 text-neutral-700"];
  if (new Date(p.ends_at) <= now) return ["Ended", "bg-neutral-200 text-neutral-700"];
  if (new Date(p.starts_at) > now) return ["Scheduled", "bg-blue-100 text-blue-800"];
  return ["Live", "bg-green-100 text-green-800"];
};

const PromotionsManager = () => {
  const { refresh } = useStoreData();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast, confirm } = useFeedback();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : form?.image || ""),
    [imageFile, form?.image]
  );

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const closeForm = () => {
    setForm(null);
    setImageFile(null);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    const starts = new Date(form.starts_at);
    const ends = new Date(form.ends_at);

    if (!form.title.trim()) return setError("Please add a title.");
    if (!(ends > starts)) return setError("The end date must be after the start date.");

    setBusy(true);
    setError("");
    try {
      const image = imageFile ? await uploadFile(imageFile, "promotions") : form.image;
      const row = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        badge: form.badge.trim() || null,
        discount_percent: Math.min(90, Math.max(0, Number(form.discount_percent) || 0)),
        category: form.category || null,
        style: form.style,
        font: form.font,
        image: image || null,
        cta: form.cta.trim() || "Shop the sale",
        link: form.link.trim() || "/products",
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        active: form.active,
      };

      const query = form.id
        ? supabase.from("promotions").update(row).eq("id", form.id)
        : supabase.from("promotions").insert(row);
      const { error: dbError } = await query;
      if (dbError) throw dbError;

      let sent = 0;
      if (!form.id && notify) {
        const { data } = await supabase.rpc("send_notification", {
          p_title: `${row.title} is live! 🔥`,
          p_body:
            row.discount_percent > 0
              ? `Enjoy ${row.discount_percent}% off${row.category ? ` on ${row.category}` : " our products"} until ${ends.toLocaleDateString()}. Shop now before it ends!`
              : row.subtitle || "Check out our latest offers in the store.",
          p_type: "promo",
          p_link: row.link,
        });
        sent = data ?? 0;
      }

      await Promise.all([load(), refresh()]);
      toast.success(
        form.id
          ? "Sale updated ✅"
          : sent
            ? `Sale created and ${sent} customer${sent === 1 ? "" : "s"} notified 🎉`
            : "Sale created 🎉"
      );
      closeForm();
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    }
    setBusy(false);
  };

  const remove = async (promo) => {
  const ok = await confirm({
    title: "Delete this sale?",
    message: `"${promo.title}" will be removed and prices go back to normal.`,
    confirmText: "Delete",
    danger: true,
  });
  if (!ok) return;
  const { error: dbError } = await supabase.from("promotions").delete().eq("id", promo.id);
  if (dbError) {
    toast.error(dbError.message);
  } else {
    await Promise.all([load(), refresh()]);
    toast.success("Sale deleted");
  }
};

  if (form) {
    const preview = {
      ...form,
      image: imagePreview,
      discount_percent: Number(form.discount_percent) || 0,
    };

    return (
      <form onSubmit={save} className="grid gap-3">
        <p className="text-xs text-neutral-500">
          Preview (this is how customers will see it)
        </p>
        <div className="pointer-events-none">
          <PromoCard promo={preview} />
        </div>

        <input className={input} placeholder="Sale title, e.g. EMBER SALES" value={form.title} maxLength={60} onChange={set("title")} />
        <input className={input} placeholder="Small line above the title, e.g. LIMITED TIME (optional)" value={form.badge} maxLength={30} onChange={set("badge")} />
        <input className={input} placeholder="Short message, e.g. Up to 40% off this December (optional)" value={form.subtitle} maxLength={140} onChange={set("subtitle")} />

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Discount %
            <input className={input} type="number" inputMode="numeric" min="0" max="90" placeholder="e.g. 25 (0 = banner only)" value={form.discount_percent} onChange={set("discount_percent")} />
          </label>
          <label className={labelClass}>
            Applies to
            <select className={input} value={form.category} onChange={set("category")}>
              <option value="">All products</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c} only</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className={labelClass}>Background style</p>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {Object.entries(PROMO_STYLES).map(([key, s]) => (
              <button
                type="button"
                key={key}
                onClick={() => setForm({ ...form, style: key })}
                className={`rounded-xl border-2 p-1 text-[11px] font-semibold ${
                  form.style === key ? "border-neutral-900" : "border-transparent"
                }`}
              >
                <span className="block h-10 rounded-lg" style={{ background: s.bg }} />
                <span className="mt-1 block truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <label className={labelClass}>
          Font
          <select className={input} value={form.font} onChange={set("font")}>
            {Object.entries(PROMO_FONTS).map(([key, f]) => (
              <option key={key} value={key}>{f.label}</option>
            ))}
          </select>
        </label>

        <div>
          <label className={labelClass}>
            Or upload a ready-made design (replaces the text banner)
          </label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mt-1 block w-full text-sm" />
          {(form.image || imageFile) && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setForm({ ...form, image: "" });
              }}
              className="mt-1 text-sm text-red-600 underline underline-offset-4"
            >
              Remove image and use text instead
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Button text
            <input className={input} value={form.cta} onChange={set("cta")} />
          </label>
          <label className={labelClass}>
            Button link
            <input className={input} value={form.link} onChange={set("link")} placeholder="/products?category=Fashion" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Starts
            <input className={input} type="datetime-local" value={form.starts_at} onChange={set("starts_at")} />
          </label>
          <label className={labelClass}>
            Ends
            <input className={input} type="datetime-local" value={form.ends_at} onChange={set("ends_at")} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Sale is switched on
        </label>

        {!form.id && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Send customers a notification about this sale
          </label>
        )}

        <p className="text-xs text-neutral-500">
          Prices drop automatically while the sale is live and go back to normal when it ends. Your original prices are never changed.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} className="flex-1 rounded-full bg-neutral-900 text-white py-3 font-semibold disabled:opacity-50">
            {busy ? "Saving..." : form.id ? "Save changes" : "Create sale"}
          </button>
          <button type="button" onClick={closeForm} className="rounded-full border border-neutral-300 px-5 py-3 font-semibold">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  return (
    <div className="grid gap-3">
      <button onClick={() => setForm(blank())} className="rounded-full bg-neutral-900 text-white py-3 font-semibold">
        + New sale
      </button>

      {promos.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-6">No sales yet.</p>
      )}

      {promos.map((p) => {
        const [label, style] = statusOf(p);
        return (
          <div key={p.id} className="rounded-2xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold truncate">{p.title}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{label}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {p.discount_percent > 0 ? `${p.discount_percent}% off ${p.category ?? "all products"}` : "Banner only"} ·{" "}
              {new Date(p.starts_at).toLocaleDateString()} to {new Date(p.ends_at).toLocaleDateString()}
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              <button
                onClick={() =>
                  setForm({
                    ...p,
                    subtitle: p.subtitle ?? "",
                    badge: p.badge ?? "",
                    discount_percent: String(p.discount_percent),
                    category: p.category ?? "",
                    image: p.image ?? "",
                    starts_at: toLocalInput(p.starts_at),
                    ends_at: toLocalInput(p.ends_at),
                  })
                }
                className="font-semibold underline underline-offset-4"
              >
                Edit
              </button>
              <button onClick={() => remove(p)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromotionsManager;