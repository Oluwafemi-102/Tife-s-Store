import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Your cart is empty</h2>
        <p className="mt-2 opacity-80">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-white text-black px-6 py-3 font-semibold"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-3xl font-bold mb-6">Your Cart ({totalItems})</h2>

      <div className="grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="bg-white text-neutral-900 rounded-2xl p-4 shadow-md flex items-center gap-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover bg-neutral-100"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-neutral-500">{formatPrice(item.price)}</p>

              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-full border border-neutral-300 hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-full border border-neutral-300 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 bg-white text-neutral-900 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between text-lg">
          <span>Total</span>
          <span className="font-bold">{formatPrice(totalPrice)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => alert("Checkout coming soon")}
            className="flex-1 rounded-full bg-neutral-900 text-white px-6 py-3 font-semibold hover:bg-neutral-700 transition"
          >
            Checkout
          </button>
          <button
            onClick={clearCart}
            className="rounded-full border border-neutral-300 px-6 py-3 font-semibold hover:bg-neutral-100 transition"
          >
            Clear cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;