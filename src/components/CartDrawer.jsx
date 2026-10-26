import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  // Close with Escape, and stop the page behind from scrolling while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[100] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Dark backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white text-neutral-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-bold">
            Your Cart{" "}
            <span className="text-neutral-400 font-medium">({totalItems})</span>
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full hover:bg-neutral-100 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="text-5xl">🛍️</div>
            <h3 className="mt-3 text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add something you love and it will show up here.
            </p>
            <button
              onClick={closeCart}
              className="mt-5 rounded-full bg-neutral-900 text-white px-6 py-2.5 font-semibold hover:bg-neutral-700 transition"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4 grid gap-4 content-start">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-neutral-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          {item.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-neutral-400 hover:text-red-600 text-xl leading-none self-start"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-neutral-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 rounded-full hover:bg-neutral-100"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 rounded-full hover:bg-neutral-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-neutral-200 px-5 py-4 bg-neutral-50">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Delivery is calculated at checkout.
              </p>

              <button
                onClick={() => alert("Checkout coming soon")}
                className="mt-4 w-full rounded-full bg-neutral-900 text-white py-3 font-semibold hover:bg-neutral-700 transition"
              >
                Checkout
              </button>
              <div className="mt-3 flex justify-between text-sm">
                <button
                  onClick={closeCart}
                  className="font-medium underline underline-offset-4"
                >
                  Continue shopping
                </button>
                <button
                  onClick={clearCart}
                  className="text-neutral-500 hover:text-red-600"
                >
                  Clear cart
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;