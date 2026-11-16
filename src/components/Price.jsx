import { formatPrice } from "../utils/formatPrice";

export const SaleBadge = ({ product, className = "" }) =>
  product.onSale ? (
    <span
      className={`rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow ${className}`}
    >
      SALE -{product.discountPercent}%
    </span>
  ) : null;

const Price = ({ product, size = "text-lg" }) =>
  product.onSale ? (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${size} font-bold text-rose-600`}>{formatPrice(product.price)}</span>
      <span className="text-sm text-neutral-400 line-through">
        {formatPrice(product.listPrice)}
      </span>
    </span>
  ) : (
    <span className={`${size} font-bold`}>{formatPrice(product.price)}</span>
  );

export default Price;