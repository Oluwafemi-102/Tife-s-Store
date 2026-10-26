import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useStoreData } from "../../context/StoreDataContext";
import Stars from "../Stars";

const ReviewsManager = () => {
  const { refresh } = useStoreData();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", review.id);
    if (error) {
      alert(error.message);
    } else {
      await load();
      refresh();
    }
  };

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-500 text-center py-6">No reviews yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{r.products?.name ?? "Deleted product"}</p>
            <Stars value={r.rating} size="text-base" />
          </div>
          <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">{r.comment}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>
              {r.name} · {new Date(r.created_at).toLocaleDateString()}
            </span>
            <button onClick={() => remove(r)} className="text-red-600 text-sm">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsManager;