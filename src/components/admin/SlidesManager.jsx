import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { uploadFile } from "../../lib/uploadFile";
import { useStoreData } from "../../context/StoreDataContext";

const empty = {
  title: "",
  text: "",
  cta: "Shop now",
  link: "/products",
  bg: "#92400e",
  textColor: "#ffffff",
  position: 0,
  model: "",
};
const input = "border border-neutral-300 rounded-lg px-3 py-3 w-full";

const SlidesManager = () => {
  const { slides, refresh } = useStoreData();
  const [form, setForm] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const closeForm = () => {
    setForm(null);
    setModelFile(null);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (!form.model && !modelFile) {
      setError("Please upload a 3D model (.glb).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const model = modelFile ? await uploadFile(modelFile, "models") : form.model;
      const row = {
        title: form.title.trim(),
        text: form.text.trim(),
        cta: form.cta.trim() || "Shop now",
        link: form.link.trim() || "/products",
        bg: form.bg,
        text_color: form.textColor,
        position: Number(form.position) || 0,
        model,
      };
      const query = form.id
        ? supabase.from("slides").update(row).eq("id", form.id)
        : supabase.from("slides").insert(row);
      const { error: dbError } = await query;
      if (dbError) throw dbError;
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    }
    setBusy(false);
  };

  const remove = async (slide) => {
    if (!window.confirm(`Delete slide "${slide.title}"?`)) return;
    const { error: dbError } = await supabase.from("slides").delete().eq("id", slide.id);
    if (dbError) alert(dbError.message);
    else refresh();
  };

  if (form) {
    return (
      <form onSubmit={save} className="grid gap-3">
        <input className={input} placeholder="Title" value={form.title} onChange={set("title")} />
        <textarea className={input} rows={2} placeholder="Short text under the title" value={form.text} onChange={set("text")} />
        <input className={input} placeholder="Button text" value={form.cta} onChange={set("cta")} />
        <input className={input} placeholder="Button link (e.g. /products?category=Fashion)" value={form.link} onChange={set("link")} />

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-neutral-600">
            Background color
            <input type="color" value={form.bg} onChange={set("bg")} className="block w-full h-12 mt-1" />
          </label>
          <label className="text-sm text-neutral-600">
            Text color
            <input type="color" value={form.textColor} onChange={set("textColor")} className="block w-full h-12 mt-1" />
          </label>
        </div>

        <label className="text-sm text-neutral-600">
          Order (1 shows first)
          <input className={input} type="number" value={form.position} onChange={set("position")} />
        </label>

        <div>
          <label className="text-sm text-neutral-600">3D model (.glb)</label>
          {form.model && !modelFile && (
            <p className="text-xs text-neutral-500 my-1">A model is already attached.</p>
          )}
          <input type="file" accept=".glb,model/gltf-binary" onChange={(e) => setModelFile(e.target.files[0])} className="block w-full text-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} className="flex-1 rounded-full bg-neutral-900 text-white py-3 font-semibold disabled:opacity-50">
            {busy ? "Saving..." : form.id ? "Save changes" : "Add slide"}
          </button>
          <button type="button" onClick={closeForm} className="rounded-full border border-neutral-300 px-5 py-3 font-semibold">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-3">
      <button onClick={() => setForm({ ...empty, position: slides.length + 1 })} className="rounded-full bg-neutral-900 text-white py-3 font-semibold">
        + Add slide
      </button>

      {slides.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-6">No slides yet.</p>
      )}

      {slides.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3">
          <span className="w-10 h-10 rounded-xl shrink-0 border border-neutral-200" style={{ backgroundColor: s.bg }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{s.title}</p>
            <p className="text-xs text-neutral-500">Order {s.position}</p>
          </div>
          <button onClick={() => setForm({ ...s, text: s.text ?? "", textColor: s.text_color })} className="text-sm font-semibold underline underline-offset-4">
            Edit
          </button>
          <button onClick={() => remove(s)} className="text-sm text-red-600">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default SlidesManager;