import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminView from "./pages/AdminView";
import CartPage from "./pages/CartPage";
import CreateMenuPage from "./pages/CreateMenuPage";
import CustomerView from "./pages/CustomerView";
import KitchenView from "./pages/KitchenView";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import SuspendMenuPage from "./pages/SuspendMenuPage";

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
        <Route
          path="/admin/suspend-menu"
          element={
            <ProtectedRoute>
              <SuspendMenuPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
