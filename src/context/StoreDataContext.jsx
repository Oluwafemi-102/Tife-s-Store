import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const StoreDataContext = createContext(null);

export const StoreDataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});

  const refresh = useCallback(async () => {
    const [p, s, r] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("slides").select("*").order("position", { ascending: true }),
      supabase.from("product_rating_stats").select("*"),
    ]);
    if (!p.error) {
      setProducts(p.data.map((x) => ({ ...x, price: Number(x.price) })));
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
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <StoreDataContext.Provider value={{ products, slides, ratings, loading, refresh }}>
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const ctx = useContext(StoreDataContext);
  if (!ctx) throw new Error("useStoreData must be used inside <StoreDataProvider>");
  return ctx;
};