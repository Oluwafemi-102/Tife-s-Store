import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useStoreData } from "../context/StoreDataContext";
import { useFeedback } from "../context/FeedbackContext";
import Stars from "./Stars";

const MyReviews = ({ onOpenProduct }) => {
  const { user } = useAuth();
  const { refresh } = useStoreData();
  const { toast, confirm } = useFeedback();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*, products(name, image)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (review) => {
    const ok = await confirm({
      title: "Delete your review?",
      message: "It will be removed from the product page.",
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", review.id);
    if (error) {
      toast.error("Could not delete your review. Please try again.");
      return;
    }
    toast.success("Your review was deleted");
    await load();
    refresh();
  };

  if (loading) return <p className="py-10 text-center text-sm text-neutral-500">Loading...</p>;

  if (reviews.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <p className="text-4xl">⭐</p>
        <p className="mt-3 font-semibold">No reviews yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Open a product and share what you think. Your reviews will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4">
      {reviews.map((r) => (
        <article key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
          <button
            onClick={() => onOpenProduct?.(r.product_id)}
            className="flex w-full items-center gap-3 text-left"
          >
            {r.products?.image && (
              <img
                src={r.products.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl bg-neutral-100 object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {r.products?.name ?? "Product no longer available"}
              </span>
              <Stars value={r.rating} size="text-base" />
            </span>
          </button>

          <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">{r.comment}</p>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>{new Date(r.created_at).toLocaleDateString()}</span>
            <button onClick={() => remove(r)} className="text-red-600">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default MyReviews;