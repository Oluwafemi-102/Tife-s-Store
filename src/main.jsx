import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { StoreDataProvider } from "./context/StoreDataContext";
import { AdminProvider } from "./context/AdminContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreDataProvider>
          <AdminProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AdminProvider>
        </StoreDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
