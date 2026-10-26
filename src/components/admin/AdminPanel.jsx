import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { supabase } from "../../lib/supabase";
import ProductsManager from "./ProductsManager";
import SlidesManager from "./SlidesManager";
import ReviewsManager from "./ReviewsManager";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminPanel = () => {
  const { open, closeAdmin, session, signOut } = useAdmin();
  const [view, setView] = useState("menu");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!open) return;
    setView("menu");
    const onKey = (e) => e.key === "Escape" && closeAdmin();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, closeAdmin]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });
    setBusy(false);
    setPassword("");
    if (authError) setError("Incorrect password.");
  };

  const titles = {
    menu: "Admin",
    products: "Products",
    slides: "Hero slides",
    reviews: "Product reviews",
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-white text-neutral-900 w-full sm:max-w-2xl max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            {isAdmin && view !== "menu" && (
              <button
                onClick={() => setView("menu")}
                aria-label="Back"
                className="w-9 h-9 rounded-full hover:bg-neutral-100 text-xl"
              >
                ←
              </button>
            )}
            <h2 className="text-xl font-bold">
              {isAdmin ? titles[view] : "Admin access"}
            </h2>
          </div>
          <button
            onClick={closeAdmin}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-neutral-100 text-2xl leading-none"
          >
            ×
          </button>
          <button
            onClick={() => setView("reviews")}
            className="rounded-2xl border border-neutral-300 p-4 text-left hover:bg-neutral-50"
          >
            <span className="font-semibold">Product reviews</span>
            <span className="block text-sm text-neutral-500">
              Read and delete customer reviews
            </span>
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {!isAdmin ? (
            <form onSubmit={handleLogin} className="grid gap-3">
              <label className="text-sm text-neutral-600">Enter the admin password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className="border border-neutral-300 rounded-lg px-3 py-3"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={busy || !password}
                className="rounded-full bg-neutral-900 text-white py-3 font-semibold disabled:opacity-50"
              >
                {busy ? "Checking..." : "Unlock"}
              </button>
            </form>
          ) : view === "menu" ? (
            <div className="grid gap-3">
              <p className="text-neutral-600">What do you want to update?</p>
              <button
                onClick={() => setView("products")}
                className="rounded-2xl border border-neutral-300 p-4 text-left hover:bg-neutral-50"
              >
                <span className="font-semibold">Products</span>
                <span className="block text-sm text-neutral-500">
                  Add, edit or delete products, prices, images and 3D models
                </span>
              </button>
              <button
                onClick={() => setView("slides")}
                className="rounded-2xl border border-neutral-300 p-4 text-left hover:bg-neutral-50"
              >
                <span className="font-semibold">Hero slides</span>
                <span className="block text-sm text-neutral-500">
                  Change the slides at the top of the home page
                </span>
              </button>
              <button
                onClick={() => {
                  signOut();
                  closeAdmin();
                }}
                className="mt-2 text-sm text-neutral-500 underline underline-offset-4"
              >
                Sign out
              </button>
            </div>
          ) : view === "products" ? (
            <ProductsManager />
          ) : view === "slides" ? (
            <SlidesManager />
          ) : (
            <ReviewsManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;