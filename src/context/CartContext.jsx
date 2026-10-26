import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const keyFor = (userId) => `tife-cart-${userId}`;

const loadCart = (userId) => {
  try {
    const saved = localStorage.getItem(keyFor(userId));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (userId, items) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {
    /* storage unavailable, cart still works for this visit */
  }
};

export const CartProvider = ({ children }) => {
  const { user, openAuth, authOpen } = useAuth();
  const userId = user?.id ?? null;

  const [cart, setCart] = useState({ ownerId: null, items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(null); // item waiting for sign-in

  // Load this user's cart whenever the signed-in user changes
  useEffect(() => {
    setCart({ ownerId: userId, items: userId ? loadCart(userId) : [] });
    if (!userId) setIsOpen(false);
  }, [userId]);

  // Save, but only once the cart belongs to the current user
  useEffect(() => {
    if (cart.ownerId && cart.ownerId === userId) saveCart(userId, cart.items);
  }, [cart, userId]);

  // Forget a waiting item if the sign-in window is closed without signing in
  useEffect(() => {
    if (!authOpen && !userId) setPending(null);
  }, [authOpen, userId]);

  const items = cart.ownerId === userId ? cart.items : [];

  const updateItems = (fn) =>
    setCart((prev) => ({ ...prev, items: fn(prev.items) }));

  const addItem = (product, qty = 1) =>
    updateItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: qty,
        },
      ];
    });

  // Returns true if the item was added, false if the user must sign in first
  const addToCart = (product, qty = 1) => {
    if (!userId) {
      setPending({ product, qty });
      openAuth("signin", "Sign in to add items to your cart.");
      return false;
    }
    addItem(product, qty);
    return true;
  };

  // Finish an add that was waiting for the customer to sign in
  useEffect(() => {
    if (pending && userId && cart.ownerId === userId) {
      addItem(pending.product, pending.qty);
      setPending(null);
      setIsOpen(true);
    }
  }, [pending, userId, cart.ownerId]);

  const removeFromCart = (id) =>
    updateItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, quantity) =>
    updateItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

  const clearCart = () => updateItems(() => []);

  const openCart = () => {
    if (!userId) {
      openAuth("signin", "Sign in to view your cart.");
      return;
    }
    setIsOpen(true);
  };
  const closeCart = () => setIsOpen(false);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};