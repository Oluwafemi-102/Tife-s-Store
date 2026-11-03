import { Route, Routes, useLocation } from "react-router-dom"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Products from "./components/Products";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/admin/AdminPanel";
import ProductDetails from "./components/ProductDetails";
import AuthPage from "./components/AuthPage";
import OrdersPage from "./components/OrdersPage";
import OrdersModal from "./components/OrdersModal";

const App = () => {
  const { pathname } = useLocation();
  const standalone = pathname === "/auth";
  // When the orders modal is open, the page behind it is the one the customer came from
  const isOrders = location.pathname === "/orders";
  const background = location.state?.background;

  return (
    <div className="ubuntu-medium">
      {!standalone && <Header />}
      <Routes location={isOrders ? background || "/" : location}>
        <Route path="/" element={<Hero />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
      <Products />
      {!standalone && <CartDrawer />}
      <OrdersModal />
      <AdminPanel />
      <Reviews />
      {!standalone && <Footer />}
    </div>
  )
}

export default App