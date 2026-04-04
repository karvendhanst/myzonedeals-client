import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DealerDashboard from "./pages/DealerDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import useAuthStore from "./store/authStore";
import DealerPortal from "./pages/DealerPortal";
import AddShopForm from "./pages/AddShopForm";
import AddDealsPage from "./pages/AddDealsPage";
import ShopDealsPage from "./pages/ShopDealsPage";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop-portal" element={<DealerPortal />} />
        <Route
          path="/add-shop"
          element={
            <ProtectedRoute>
              <AddShopForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute>
              <DealerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/:shopId/add-deals"
          element={
            <ProtectedRoute>
              <AddDealsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/:shopId/deals"
          element={
            <ProtectedRoute>
              <ShopDealsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
