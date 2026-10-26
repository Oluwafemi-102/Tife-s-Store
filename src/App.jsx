import { Route, Routes } from "react-router-dom"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Products from "./components/Products";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/admin/AdminPanel";
import ProductDetails from "./components/ProductDetails";
import AuthModal from "./components/AuthModal";

const App = () => {
  return (
    <div className="ubuntu-medium">
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Routes>
      <Products />
      <CartDrawer />
      <AdminPanel />
      <AuthModal />
      <Reviews />
      <Footer />
    </div>
  )
}

export default App