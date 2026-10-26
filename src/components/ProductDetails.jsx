import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useStoreData } from "../context/StoreDataContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { WHATSAPP_NUMBER } from "../config";
import Stars from "./Stars";
import { useAuth } from "../context/AuthContext";

const tab = (on) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold border transition ${on ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:bg-neutral-100"
  }`;

const inputClass = "border border-neutral-300 rounded-lg px-3 py-3 w-full";

const ProductDetails = () => {
  const { id } = useParams();
  const { products, loading, refresh } = useStoreData();
  const { addToCart, openCart } = useCart();
  const { user, displayName, openAuth } = useAuth();

  const product = products.find((p) => String(p.id) === id);

  const [qty, setQty] = useState(1);
  const [view, setView] = useState("photo"); // "photo" | "3d"
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);


  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  const loadReviews = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false });
    if (!dbError) setReviews(data);
  }, [id]);

  // Reset the page when switching to a different product
  useEffect(() => {
    setQty(1);
    setView("photo");
    window.scrollTo(0, 0);
    loadReviews();
  }, [loadReviews]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    const counts = [5, 4, 3, 2, 1].map((n) => reviews.filter((r) => r.rating === n).length);
    return { count, average, counts };
  }, [reviews]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  if (loading) {
    return <p className="min-h-screen bg-neutral-900 text-white pt-52 text-center">Loading...</p>;
  }

  if (!product) {
    return (
      <section className="min-h-screen bg-neutral-900 text-white pt-52 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block underline underline-offset-4">
          Back to products
        </Link>
      </section>
    );
  }

  const chatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello! I have a question about "${product.name}" (${window.location.href})`
  )}`;

  const handleAdd = () => {
  if (addToCart(product, qty)) openCart();
};

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuth("signin");
      return;
    }
    if (rating < 1 || comment.trim().length < 3) {
      setError("Please add a star rating and a short comment.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: dbError } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      name: displayName.slice(0, 60),
      rating,
      comment: comment.trim(),
    });
    setBusy(false);
    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "You've already reviewed this product."
          : "Could not post your review. Please try again."
      );
      return;
    }
    setRating(0);
    setComment("");
    await loadReviews();
    refresh(); // updates the stars on the product cards
  };

  const deleteMyReview = async () => {
    if (!myReview || !window.confirm("Delete your review?")) return;
    const { error: dbError } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", myReview.id);
    if (dbError) {
      alert("Could not delete your review.");
      return;
    }
    await loadReviews();
    refresh();
  };

  return (
    <section className="min-h-screen bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6 pt-44 pb-12">
        <Link to="/products" className="text-sm opacity-80 hover:opacity-100">
          ← Back to products
        </Link>

        {/* Product info */}
        <div className="mt-4 grid gap-8 md:grid-cols-2 bg-white text-neutral-900 rounded-3xl p-5 md:p-8">
          {/* Media */}
          <div>
            <div className="aspect-square rounded-2xl bg-neutral-100 overflow-hidden">
              {view === "3d" && product.model ? (
                <model-viewer
                  src={product.model}
                  alt={product.name}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>

            {product.model && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => setView("photo")} className={tab(view === "photo")}>
                  Photo
                </button>
                <button onClick={() => setView("3d")} className={tab(view === "3d")}>
                  View in 3D
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>

            <a href="#reviews" className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <Stars value={stats.average} />
              {stats.count
                ? `${stats.average.toFixed(1)} (${stats.count} review${stats.count > 1 ? "s" : ""})`
                : "No reviews yet"}
            </a>

            <p className="mt-4 text-3xl font-bold">{formatPrice(product.price)}</p>

            {product.description && (
              <p className="mt-4 text-neutral-700 whitespace-pre-line">{product.description}</p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-neutral-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-full hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-full hover:bg-neutral-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 rounded-full bg-neutral-900 text-white py-3 font-semibold hover:bg-neutral-700 transition"
              >
                Add to cart
              </button>
            </div>

            <a
              href={chatUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-green-600 text-white py-3 font-semibold hover:bg-green-700 transition"
            >
              💬 Chat now about this product
            </a>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="mt-8 bg-white text-neutral-900 rounded-3xl p-5 md:p-8 scroll-mt-40">
          <h2 className="text-2xl font-bold">Ratings & Reviews</h2>

          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {/* Summary */}
            <div>
              <p className="text-5xl font-bold">{stats.count ? stats.average.toFixed(1) : "–"}</p>
              <div className="mt-1">
                <Stars value={stats.average} size="text-2xl" />
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {stats.count} review{stats.count === 1 ? "" : "s"}
              </p>

              <div className="mt-4 grid gap-1.5">
                {[5, 4, 3, 2, 1].map((n, i) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{n}</span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${stats.count ? (stats.counts[i] / stats.count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-neutral-500">{stats.counts[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* List + form */}
            <div className="md:col-span-2">
              {reviews.length === 0 ? (
                <p className="text-neutral-500">No reviews yet. Be the first to review this product.</p>
              ) : (
                <ul className="grid gap-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-neutral-200 pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <Stars value={r.rating} />
                        <span className="text-xs text-neutral-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-neutral-700 whitespace-pre-line">{r.comment}</p>
                      <p className="mt-1 text-xs text-neutral-500">by {r.name}</p>
                    </li>
                  ))}
                </ul>
              )}

              {!user ? (
                <div className="mt-8 rounded-2xl bg-neutral-50 p-5 text-center">
                  <h3 className="font-semibold text-lg">Want to review this product?</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Sign in to share your experience.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      onClick={() => openAuth("signin")}
                      className="rounded-full bg-neutral-900 text-white px-6 py-2.5 font-semibold hover:bg-neutral-700 transition"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => openAuth("signup")}
                      className="rounded-full border border-neutral-300 px-6 py-2.5 font-semibold hover:bg-neutral-100 transition"
                    >
                      Create account
                    </button>
                  </div>
                </div>
              ) : myReview ? (
                <div className="mt-8 rounded-2xl bg-neutral-50 p-5">
                  <p className="font-semibold">You've reviewed this product. Thank you!</p>
                  <button
                    onClick={deleteMyReview}
                    className="mt-2 text-sm text-red-600 underline underline-offset-4"
                  >
                    Delete my review
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReview} className="mt-8 grid gap-3 rounded-2xl bg-neutral-50 p-5">
                  <h3 className="font-semibold text-lg">Write a review</h3>
                  <p className="text-sm text-neutral-500">Posting as {displayName}</p>

                  <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className={`text-4xl leading-none ${n <= rating ? "text-amber-500" : "text-neutral-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    className={inputClass}
                    rows={4}
                    placeholder="What did you think of this product?"
                    value={comment}
                    maxLength={1000}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    disabled={busy}
                    className="rounded-full bg-neutral-900 text-white py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50 transition"
                  >
                    {busy ? "Posting..." : "Post review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;