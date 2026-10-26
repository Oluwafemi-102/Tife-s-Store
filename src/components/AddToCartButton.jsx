import { useState } from "react";
import { useCart } from "../context/CartContext";

const AddToCartButton = ({ product, className = "" }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

 const handleClick = () => {
  const ok = addToCart(product);
  if (!ok) return; // sign-in window is opening instead
  setAdded(true);
  setTimeout(() => setAdded(false), 1200);
};

  return (
    <button
      onClick={handleClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
        added ? "bg-green-600" : "bg-neutral-900 hover:bg-neutral-700"
      } ${className}`}
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
};

export default AddToCartButton;