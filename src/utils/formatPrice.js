export const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN", // change if needed
    maximumFractionDigits: 0,
  }).format(value);