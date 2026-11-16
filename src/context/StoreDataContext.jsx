import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const StoreDataContext = createContext(null);

const salePrice = (price, percent) =>
  percent > 0 ? Math.round((price * (100 - percent)) / 100) : price;

export const StoreDataProvider = ({ children }) => {
  const [rawProducts, setRawProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [ratings, setRatings] = useState({});
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

 const refresh = useCallback(async () => {
  try {
    const [p, s, r, promo] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("slides").select("*").order("position", { ascending: true }),
      supabase.from("product_rating_stats").select("*"),
      supabase.from("active_promotions").select("*").order("created_at", { ascending: false }),
    ]);

    [p, s, r, promo].forEach((res) => res.error && console.error(res.error));

    if (!p.error) {
      setRawProducts(p.data.map((x) => ({ ...x, price: Number(x.price) })));
    }
    if (!s.error) {
      setSlides(s.data.map((x) => ({ ...x, textColor: x.text_color })));
    }
    if (!r.error) {
      setRatings(
        Object.fromEntries(
          r.data.map((x) => [x.product_id, { average: Number(x.average), count: x.count }])
        )
      );
    }
    if (!promo.error) setPromotions(promo.data);
  } catch (err) {
    console.error("Could not load store data", err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // What shoppers see: the best live discount for each product's category
  const products = useMemo(
    () =>
      rawProducts.map((p) => {
        const percent = promotions.reduce(
          (best, promo) =>
            promo.discount_percent > 0 &&
            (!promo.category || promo.category === p.category)
              ? Math.max(best, promo.discount_percent)
              : best,
          0
        );
        return {
          ...p,
          listPrice: p.price,
          price: salePrice(p.price, percent),
          discountPercent: percent,
          onSale: percent > 0,
        };
      }),
    [rawProducts, promotions]
  );

  return (
    <StoreDataContext.Provider
      value={{ products, rawProducts, slides, ratings, promotions, loading, refresh }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const ctx = useContext(StoreDataContext);
  if (!ctx) throw new Error("useStoreData must be used inside <StoreDataProvider>");
  return ctx;
};