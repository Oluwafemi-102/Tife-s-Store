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

const App = () => {
  const { pathname } = useLocation();
  const standalone = pathname === "/auth";

  return (
    <div className="ubuntu-medium">
      {!standalone && <Header />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <Products />
      {!standalone && <CartDrawer />}
      <AdminPanel />
      <Reviews />
      {!standalone && <Footer />}
    </div>
  )
}

export default App