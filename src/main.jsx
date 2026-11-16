import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { StoreDataProvider } from "./context/StoreDataContext";
import { AdminProvider } from "./context/AdminContext";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { FeedbackProvider } from "./context/FeedbackContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <AuthProvider>
          <StoreDataProvider>
            <AdminProvider>
              <OrdersProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </OrdersProvider>
            </AdminProvider>
          </StoreDataProvider>
        </AuthProvider>
      </FeedbackProvider>
    </BrowserRouter>
  </StrictMode>
)
