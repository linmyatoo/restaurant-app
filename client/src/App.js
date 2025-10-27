import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerView from "./pages/CustomerView";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import KitchenView from "./pages/KitchenView";
import AdminView from "./pages/AdminView";
import CreateMenuPage from "./pages/CreateMenuPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect old route to new menu route */}
        <Route
          path="/table/:tableId"
          element={<Navigate to="menu" replace />}
        />

        {/* New split routes for customer */}
        <Route path="/table/:tableId/menu" element={<MenuPage />} />
        <Route path="/table/:tableId/cart" element={<CartPage />} />

        {/* Keep old CustomerView for backward compatibility */}
        <Route path="/customer/:tableId" element={<CustomerView />} />

        <Route path="/kitchen/:kitchenId" element={<KitchenView />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-menu"
          element={
            <ProtectedRoute>
              <CreateMenuPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
