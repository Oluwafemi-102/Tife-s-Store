import { Link, useSearchParams } from "react-router-dom";
import Stars from "./Stars";
import { formatPrice } from "../utils/formatPrice";
import AddToCartButton from "./AddToCartButton";
import { useStoreData } from "../context/StoreDataContext";

const ProductCard = ({ product }) => {
  const { ratings } = useStoreData();
  const rating = ratings[product.id];

  return (
    <article className="group bg-white text-neutral-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="block aspect-square bg-neutral-100 overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mt-1 hover:underline">{product.name}</h3>
        </Link>

        {rating ? (
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <Stars value={rating.average} size="text-sm" /> ({rating.count})
          </div>
        ) : (
          <p className="mt-1 text-xs text-neutral-400">No reviews yet</p>
        )}

        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
};

const Products = () => {
  const { products, loading } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTerm = (searchParams.get("search") ?? "").trim();
  const term = rawTerm.toLowerCase();
  const category = (searchParams.get("category") ?? "").trim();

  const visible = products.filter((p) => {
    const matchesCategory =
      !category || p.category?.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      !term ||
      [p.name, p.category, p.description].some((f) =>
        f?.toLowerCase().includes(term)
      );
    return matchesCategory && matchesSearch;
  });

  const filtering = rawTerm || category;
  const heading = rawTerm ? `Results for "${rawTerm}"` : category || "Our Products";

  return (
    <section id="products" className="min-h-screen bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-6 pt-44 pb-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold">{heading}</h2>

          {filtering && (
            <button
              onClick={() => setSearchParams({})}
              className="rounded-full border border-current px-4 py-1.5 text-sm font-semibold hover:opacity-80"
            >
              Show all ({visible.length} found)
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-16 text-center opacity-80">Loading products...</p>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">No products found</p>
            <p className="mt-1 opacity-80">
              Try a different word or another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;