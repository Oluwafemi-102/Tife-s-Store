import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { uploadFile } from "../../lib/uploadFile";
import { useStoreData } from "../../context/StoreDataContext";
import { formatPrice } from "../../utils/formatPrice";

const CATEGORIES = ["Appliances", "Fashion", "Games", "Gadgets", "Electronics"];
const empty = {
  name: "",
  price: "",
  category: CATEGORIES[0],
  description: "",
  image: "",
  model: "",
};
const input = "border border-neutral-300 rounded-lg px-3 py-3 w-full";

const ProductsManager = () => {
  const { products, refresh } = useStoreData();
  const [form, setForm] = useState(null); // null = show the list
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const closeForm = () => {
    setForm(null);
    setImageFile(null);
    setModelFile(null);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === "") {
      setError("Name and price are required.");
      return;
    }
    if (!form.image && !imageFile) {
      setError("Please add a product image.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = imageFile ? await uploadFile(imageFile, "products") : form.image;
      const model = modelFile ? await uploadFile(modelFile, "models") : form.model;
      const row = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        description: form.description.trim(),
        image,
        model: model || null,
      };
      const query = form.id
        ? supabase.from("products").update(row).eq("id", form.id)
        : supabase.from("products").insert(row);
      const { error: dbError } = await query;
      if (dbError) throw dbError;
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    }
    setBusy(false);
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const { error: dbError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (dbError) alert(dbError.message);
    else refresh();
  };

  if (form) {
    return (
      <form onSubmit={save} className="grid gap-3">
        <input className={input} placeholder="Product name" value={form.name} onChange={set("name")} />
        <input className={input} type="number" inputMode="decimal" placeholder="Price" value={form.price} onChange={set("price")} />
        <select className={input} value={form.category} onChange={set("category")}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea className={input} rows={3} placeholder="Description" value={form.description} onChange={set("description")} />

        <div>
          <label className="text-sm text-neutral-600">Product image</label>
          {form.image && !imageFile && (
            <img src={form.image} alt="" className="w-24 h-24 object-cover rounded-xl my-2" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="block w-full text-sm" />
        </div>

        <div>
          <label className="text-sm text-neutral-600">3D model (.glb, optional)</label>
          {form.model && !modelFile && (
            <p className="text-xs text-neutral-500 my-1">A model is already attached.</p>
          )}
          <input type="file" accept=".glb,model/gltf-binary" onChange={(e) => setModelFile(e.target.files[0])} className="block w-full text-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} className="flex-1 rounded-full bg-neutral-900 text-white py-3 font-semibold disabled:opacity-50">
            {busy ? "Saving..." : form.id ? "Save changes" : "Add product"}
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
      <button onClick={() => setForm(empty)} className="rounded-full bg-neutral-900 text-white py-3 font-semibold">
        + Add product
      </button>

      {products.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-6">No products yet.</p>
      )}

      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3">
          <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-neutral-100" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{p.name}</p>
            <p className="text-xs text-neutral-500">
              {p.category} · {formatPrice(p.price)}
            </p>
          </div>
          <button onClick={() => setForm({ ...p, price: String(p.price), description: p.description ?? "", model: p.model ?? "" })} className="text-sm font-semibold underline underline-offset-4">
            Edit
          </button>
          <button onClick={() => remove(p)} className="text-sm text-red-600">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductsManager;