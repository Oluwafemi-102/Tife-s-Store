import { createContext, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = location.pathname === "/orders";
  const background = location.state?.background;

  // Go to /orders and remember which page was behind the modal
  const openOrders = useCallback(() => {
    if (location.pathname === "/orders") return;
    navigate("/orders", { state: { background: location } });
  }, [navigate, location]);

  // Go back to the page behind (or home if /orders was opened directly)
  const closeOrders = useCallback(() => {
    if (background) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate, background]);

  return (
    <OrdersContext.Provider value={{ isOpen, openOrders, closeOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
  return ctx;
};